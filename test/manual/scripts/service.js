const client = require("../client");

// one service
client.connect((error, deployer) => {
	if (error) {
		return console.log(error);
	}
	client.driver.get.one.service(deployer, {"namespace": "kube-system", "name": "metrics-server"}, (error, item) => console.log(error || JSON.stringify(item)));
});
