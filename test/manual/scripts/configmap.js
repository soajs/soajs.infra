const client = require("../client");

// one config map
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.get.one.configmap(deployer, {"namespace": "chirpstack", "name": "config-gateway-bridge"}, (error, item) => console.log(error || JSON.stringify(item)));
});
