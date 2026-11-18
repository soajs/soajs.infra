const client = require("../client");

// a pod's log (follow is not supported: the current log is answered)
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.pod.log(deployer, {"namespace": "soajs", "name": "dashboard-oauth-v1-785b4b6df8-2nvn6", "lines": 400}, (error, log) => console.log(error || log));
});
