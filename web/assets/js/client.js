var client = {
    apiUrl: "https://api.quizfreely.com",
    get: function (path, callback) {
        fetch(apiUrl + path).then(
            function (response) {
                return response.json()
            }
        ).then(
            function(responseJson) {
                callback(responseJson);
            }
        )
    },
    req: function (path, callback, method, body) {
        var reqMethod = "POST";
        if (method) {
            reqMethod = method
        }
        
        var reqBody = {};
        if (body && body.session) {
            reqBody = body
        } else if (body && window.localStorage && localStorage.getItem("sessionId") && localStorage.getItem("sessionToken")) {
            reqBody = {
                ...body,
                session: {
                    id: localStorage.getItem("sessionId"),
                    token: localStorage.getItem("sessionToken")
                }
            }
        } else if (window.localStorage && localStorage.getItem("sessionId") && localStorage.getItem("sessionToken")) {
            reqBody = {
                session: {
                    id: localStorage.getItem("sessionId"),
                    token: localStorage.getItem("sessionToken")
                }
            }
        }
        fetch(
            apiUrl + path,
            {
                method: reqMethod,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reqBody)
            }
        ).then(
            function (response) {
                return response.json()
            }
        ).then(
            function(responseJson) {
                if (responseJson.session && window.localStorage) {
                    localStorage.setItem("sessionId", responseJson.session.id);
                    localStorage.setItem("sessionToken", responseJson.session.token);
                }
                callback(responseJson);
            }
        )
    },
    hasSession: function () {
        if (window.localStorage && localStorage.getItem("sessionId") && localStorage.getItem("sessionToken")) {
            return true;
        } else{
            return false;
        }
    }
}
