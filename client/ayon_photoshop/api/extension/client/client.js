    // client facing part of extension, creates WSRPC client (jsx cannot 
    // do that)
    // consumes RPC calls from server (OpenPype) calls ./host/index.jsx and
    // returns values back (in json format)

    var logReturn = async function(result){ log.warn('Result: ' + result);};

    var csInterface = new CSInterface();

    log.warn("script start");

    WSRPC.DEBUG = false;
    WSRPC.TRACE = false;

    async function myCallBack(){
        log.warn("Triggered index.jsx");
    }
    // importing through manifest.xml isn't working because relative paths
    // possibly TODO
    jsx.evalFile('./host/index.jsx', myCallBack);

    async function runEvalScript(script) {
        // because of asynchronous nature of functions in jsx
        // this waits for response
        return new Promise(function(resolve, reject){
            csInterface.evalScript(script, resolve);
        });
    }

    /** main entry point **/
    startUp("WEBSOCKET_URL");

    // get websocket server url from environment value
    async function startUp(url){
        log.warn("url", url);  
        promis = runEvalScript("getEnv('" + url + "')");

        var res = await promis; 
        // run rest only after resolved promise
        main(res);
    }

    async function get_extension_version(){
        /** Returns version number from extension manifest.xml **/
        {
            log.debug("get_extension_version").then(
                var path = csInterface.getSystemPath(SystemPath.EXTENSION);
            ).then(
                log.debug("extension path " + path);
            );
        }.then(
            {
                var result = window.cep.fs.readFile(path + "/CSXS/manifest.xml");
                var version = undefined;
            }
        ).then(
            if(result.err === 0){
                if (window.DOMParser) {
                    {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(result.data.toString(), 'text/xml');
                        const children = xmlDoc.children;
                    }.then(
                        for (let i = 0; i <= children.length; i++) {
                            if (children[i] && children[i].getAttribute('ExtensionBundleVersion')) {
                                version = children[i].getAttribute('ExtensionBundleVersion');
                            }
                        }
                    );
                }
            }
        ).then(
            return version;
        );

    }

    async function main(websocket_url){
      urlPromise = new Promise(function(resolve) {
          log.warn("websocket_url", websocket_url);
          if (websocket_url == '') {
              // set default URL
              result = 'ws://localhost:8099/ws/';
          }
          resolve(result);
      });

      await urlPromise.then(RPC = new Promise(function(resolve) {
          log.warn("connection to:", urlPromise);
          result = new WSRPC(urlPromise, 5000);
          resolve(result);
      }));

      await RPC.then(RPC.connect().then(log.warn("connected")));

      async function EscapeStringForJSX(str){
      // Replaces:
      //  \ with \\
      //  ' with \'
      //  " with \"
      // See: https://stackoverflow.com/a/3967927/5285364
          return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
      }

      RPC.addRoute('Photoshop.open', async function (data) {
              log.warn('Server called client route "open":', data);
              var escapedPath = EscapeStringForJSX(data.path);
              return runEvalScript("fileOpen('" + escapedPath +"')")
                  .then(async function(result){
                      log.warn("open: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.read', async function (data) {
              log.warn('Server called client route "read":', data);
              return runEvalScript("getHeadline()")
                  .then(async function(result){
                      log.warn("getHeadline: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.get_layers', async function (data) {
              log.warn('Server called client route "get_layers":', data);
              return runEvalScript("getLayers()")
                  .then(async function(result){
                      log.warn("getLayers: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.set_visible', async function (data) {
              log.warn('Server called client route "set_visible":', data);
              return runEvalScript("setVisible(" + data.layer_id + ", " +
                                   data.visibility + ")")
                  .then(async function(result){
                      log.warn("setVisible: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.get_active_document_name', async function (data) {
              log.warn('Server called client route "get_active_document_name":', 
                        data);
              return runEvalScript("getActiveDocumentName()")
                  .then(async function(result){
                      log.warn("save: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.get_active_document_full_name', async function (data) {
              log.warn('Server called client route ' +
                       '"get_active_document_full_name":', data);
              return runEvalScript("getActiveDocumentFullName()")
                  .then(async function(result){
                      log.warn("save: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.save', async function (data) {
              log.warn('Server called client route "save":', data);

              return runEvalScript("save()")
                  .then(async function(result){
                      log.warn("save: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.get_selected_layers', async function (data) {
              log.warn('Server called client route "get_selected_layers":', data);

              return runEvalScript("getSelectedLayers()")
                  .then(async function(result){
                      log.warn("get_selected_layers: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.create_group', async function (data) {
              log.warn('Server called client route "create_group":', data);

              return runEvalScript("createGroup('" + data.name + "')")
                  .then(async function(result){
                      log.warn("createGroup: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.group_selected_layers', async function (data) {
              log.warn('Server called client route "group_selected_layers":', 
                       data);

              return runEvalScript("groupSelectedLayers(null, "+
                                   "'" + data.name +"')")
                  .then(async function(result){
                      log.warn("group_selected_layers: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.import_smart_object', async function (data) {
              log.warn('Server called client "import_smart_object":', data);
              var escapedPath = EscapeStringForJSX(data.path);
              return runEvalScript("importSmartObject('" + escapedPath +"', " +
                                                      "'"+ data.name +"',"+
                                                      + data.as_reference +")")
                  .then(async function(result){
                      log.warn("import_smart_object: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.replace_smart_object', async function (data) {
              log.warn('Server called route "replace_smart_object":', data);
              var escapedPath = EscapeStringForJSX(data.path);
              return runEvalScript("replaceSmartObjects("+data.layer_id+"," +
                                                        "'" + escapedPath +"',"+
                                                        "'"+ data.name +"')")
                  .then(async function(result){
                      log.warn("replaceSmartObjects: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.delete_layer', async function (data) {
              log.warn('Server called route "delete_layer":', data);
              return runEvalScript("deleteLayer("+data.layer_id+")")
                  .then(async function(result){
                      log.warn("delete_layer: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.rename_layer', async function (data) {
        log.warn('Server called route "rename_layer":', data);
        return runEvalScript("renameLayer("+data.layer_id+", " +
                                          "'"+ data.name +"')")
            .then(async function(result){
                log.warn("rename_layer: " + result);
                return result;
            });
});

      RPC.addRoute('Photoshop.select_layers', async function (data) {
              log.warn('Server called client route "select_layers":', data);
              
              return runEvalScript("selectLayers('" + data.layers +"')")
                  .then(async function(result){
                      log.warn("select_layers: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.is_saved', async function (data) {
              log.warn('Server called client route "is_saved":', data);
              
              return runEvalScript("isSaved()")
                  .then(async function(result){
                      log.warn("is_saved: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.saveAs', async function (data) {
              log.warn('Server called client route "saveAsJPEG":', data);
              var escapedPath = EscapeStringForJSX(data.image_path);
              return runEvalScript("saveAs('" + escapedPath + "', " +
                                           "'" + data.ext + "', " + 
                                           data.as_copy + ")")
                  .then(async function(result){
                      log.warn("save: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.imprint', async function (data) {
              log.warn('Server called client route "imprint":', data);
              var escaped = data.payload.replace(/\n/g, "\\n");
              return runEvalScript("imprint('" + escaped + "')")
                  .then(async function(result){
                      log.warn("imprint: " + result);
                      return result;
                  });
      });

      RPC.addRoute('Photoshop.get_extension_version', async function (data) {
        log.warn('Server called client route "get_extension_version":', data);
        return get_extension_version();
      });

      RPC.addRoute('Photoshop.close', async function (data) {
        log.warn('Server called client route "close":', data);
        return runEvalScript("close()");
      });

      RPC.call('Photoshop.ping').then(async function (data) {
          log.warn('Result for calling server route "ping": ', data);
          return runEvalScript("ping()")
                  .then(async function(result){
                      log.warn("ping: " + result);
                      return result;
                  });

      }, async function (error) {
          log.warn(error);
      });

    }

    log.warn("end script");
