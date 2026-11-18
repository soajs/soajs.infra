const client = require("../client");

// one pod
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.get.one.pod(deployer, {"namespace": "soajs", "name": "dev-urac-v3-86d66b758c-lhcz8"}, (error, item) => console.log(error || JSON.stringify(item)));
});
