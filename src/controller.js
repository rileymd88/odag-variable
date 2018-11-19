var qlik = window.require('qlik');
var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: window.location.protocol === "https:"
};
var baseUrl = (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "api/odag/v1";

export default ['$scope', '$element', function ($scope, $element) {

    $scope.showPopup = false;
    $scope.senseUrl = (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "sense/app/";
    var enigma = $scope.component.model.enigmaModel;
    var app = qlik.currApp($scope);
    $scope.appId = app.id;


    // Watch for selection changes in the app
    app.getList("SelectionObject", function () {
        getValueExpression($scope.rowEstExpr).then(function (result) {
            $scope.actualRowEst = result;
            if (result <= $scope.rowEstRange) {
                $scope.disableAppGen = false;
                // Build bindSelectionState
                $scope.bindSelectionState = [];
                for (var i = 0; i < $scope.bindings.length; i++) {
                    getSelectionValues($scope.bindings[i].selectAppParamName, $scope.bindings[i].bindSelectionState).then(function (values) {
                        $scope.bindSelectionState.push(values);
                    })
                }                
            }
            else {
                $scope.disableAppGen = true;
            }
        })
    });

    // Function to get variables bindSelectionState

    //Function to generate selection state values
    function getSelectionValues(field, selState) {
        var functionName;
        if (selState == 'S') {
            functionName = 'GetFieldSelections';
        }
        else {
            functionName = 'Concat'
        }
        return new Promise(function (resolve, reject) {
            getStringExpression(`=${functionName}([${field}], ',')`).then(function (values) {
                var valueList = values.split(',');
                for (var v = 0; v < valueList.length; v++) {
                    var numValue;
                    if (isNaN(valueList[v])) {
                        numValue = 'NaN';
                    }
                    else {
                        numValue = valueList[v];
                    }
                    values = [];
                    values.push({ selStatus: "S", strValue: valueList[v], numValue: numValue });

                }
                resolve({ "selectionAppParamType": "Field", "selectionAppParamName": field, "values": values });
            })
        })
    }

    // Watch for changes to link id
    $scope.$watch("layout.prop.link", function () {
        getLinkInfo($scope.layout.prop.link).then(function (linkInfo) {
            $scope.bindings = linkInfo.objectDef.bindings;
            $scope.templateAppName = linkInfo.objectDef.templateAppOrigName;
            $scope.rowEstExpr = linkInfo.objectDef.rowEstExpr;
            $scope.rowEstRange = linkInfo.objectDef.properties.rowEstRange[0].highBound;
        });
        getLinkRequests($scope.layout.prop.link).then(function (linkRequests) {
            $scope.apps = linkRequests;
        });
    });

    // On start button click
    $scope.onStart = function () {
        if ($scope.showPopup == true) {
            $scope.showPopup = false;
        }
        else {
            $scope.showPopup = true;

        }
    }

    // On reload click
    $scope.onReload = function () {
        var dummyApp =   {
            "generatedApp": {
               "id": 0, 
              "name": "Creating App...",
            }
        };
        $scope.apps.push(dummyApp);
        $scope.creatingApp = true;
        enigma.app.doReload(0, true, false).then(function () {
                generateApp($scope.layout.prop.link).then(function (reply) {
                        setTimeout(function(){ 
                            getLinkRequests(reply.link.id).then(function(linkRequests){
                            $scope.apps = linkRequests;
                            $scope.creatingApp = false;
                            $scope.$apply();
                            })
                         }, 3500);           
                });
        })
    }

    $scope.onDelete = function (id) {
        $scope.deletingApp = id;
        deleteApp(id).then(function () {
            setTimeout(function () {
                getLinkRequests($scope.layout.prop.link).then(function (linkRequests) {
                    $scope.apps = linkRequests;
                    $scope.deletingApp = null;
                    $scope.$apply();
                });
            }, 2000);
        })
    }

    $scope.onRefresh = function (id) {
        $scope.refreshingApp = id;
        refreshApp(id).then(function () {
            $scope.refreshingApp = null;
            $scope.$apply();
        })
    }

    // Function to get details about ODAG link
    function getLinkInfo(linkId) {
        return new Promise(function (resolve, reject) {
            $.get(baseUrl + '/links/' + linkId, function (linkInfo) {
                resolve(linkInfo);
            })
        })
    }

    // Function to get link requests
    function getLinkRequests(linkId) {
        return new Promise(function (resolve, reject) {
            $.get(baseUrl + '/links/' + linkId + '/requests', { pending: "true"}, function (linkRequests) {
                    resolve(linkRequests);
            })
        })
    }

    // Function to get value expression
    function getValueExpression(expression) {
        return new Promise(function (resolve, reject) {
            app.createGenericObject({
                valueSelection: {
                    qValueExpression: expression
                }
            }, function (reply) {
                resolve(reply.valueSelection);
            });
        });
    }

    // Function to get value expression
    function getStringExpression(expression) {
        return new Promise(function (resolve, reject) {
            app.createGenericObject({
                stringSelection: {
                    qStringExpression: expression
                }
            }, function (reply) {
                resolve(reply.stringSelection);
            });
        });
    }

    // A hypercube needs to be created due to the fact that the Variable API acts strange https://community.qlik.com/thread/287064
    function
        getSenseVariables(variable) {
        return new Promise(function (resolve, reject) {
            app.createCube({
                "qDimensions": [{
                    "qDef": {
                        "qFieldDefs": ["Dummy"]
                    }
                }],
                "qMeasures": [{
                    "qDef": {
                        "qDef": variable,
                        "qLabel": "Variable"
                    }
                }],
                "qInitialDataFetch": [{
                    qHeight: 1,
                    qWidth: 2
                }]

            }, function (reply) {
                resolve({ variableName: variable, variableValue: reply.qHyperCube.qDataPages["0"].qMatrix["0"]["0"].qText });
            });
        })
    }

    // Function to generate new app
    function generateApp(linkId) {
        var appPayLoad = {
            "actualRowEst": $scope.actualRowEst,
            "selectionApp": $scope.appId,
            "bindSelectionState": $scope.bindSelectionState
        }


        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "POST",
                url: baseUrl + '/links/' + linkId + '/requests',
                data: JSON.stringify(appPayLoad),
                contentType: "application/json",
                crossDomain: true,
                dataType: "json",
                success: function (data, status, jqXHR) {
                    resolve(data);
                },
                error: function (jqXHR, status) {
                    // error handler
                    reject(status);
                }
            });
        })
    }

    function deleteApp(requestId) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "DELETE",
                url: baseUrl + '/requests/' + requestId + '/app',
                contentType: "application/json",
                crossDomain: true,
                dataType: "json",
                success: function (data, status, jqXHR) {
                    resolve(data);
                },
                error: function (jqXHR, status) {
                    // error handler
                    reject(status);
                }
            });
        })
    }

    function refreshApp(requestId) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "POST",
                url: baseUrl + '/requests/' + requestId + '/reloadApp',
                contentType: "application/json",
                crossDomain: true,
                dataType: "json",
                success: function (data, status, jqXHR) {
                    resolve(data);
                },
                error: function (jqXHR, status) {
                    // error handler
                    reject(status);
                }
            });
        })
    }
}]