const client = require("../client");

// the metrics of the controller pods
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.metrics.pods(deployer, {"namespace": "soajs", "filter": {"labelSelector": "soajs.service.name=controller"}}, (error, item) => console.log(error || JSON.stringify(item)));
});
