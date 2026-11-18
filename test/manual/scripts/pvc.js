const client = require("../client");

// one persistent volume claim
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.get.one.pvc(deployer, {"namespace": "chirpstack", "name": "redisdata"}, (error, item) => console.log(error || JSON.stringify(item)));
});
