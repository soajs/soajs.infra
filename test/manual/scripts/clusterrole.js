const client = require("../client");

// one cluster role
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.get.one.clusterrole(deployer, {"name": "system:aggregated-metrics-reader"}, (error, item) => console.log(error || JSON.stringify(item)));
});
