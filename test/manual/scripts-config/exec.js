const client = require("../client-config");

// a command in a pod, through the client (with ca)
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.pod.exec(deployer, {"namespace": "mathieu", "name": "mathieu-oauth-v1-6f76874964-8qj57", "config": {}, "ca": true, "commands": ["cat package.json"]}, (error, result) => console.log(error || JSON.stringify(result)));
});
