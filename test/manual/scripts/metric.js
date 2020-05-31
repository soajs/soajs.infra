
let client = require("../client").client;
//
// Fetch all the pods
async function main() {
	return await client.apis["metrics.k8s.io"].v1beta1.pods.get();
	//return await client.apis["metrics.k8s.io"].v1beta1.namespaces("soajs").pods("dev-urac-v3-86d66b758c-lhcz8").get();
}
//get namespaces
main().then((service) => {
	
	console.log(JSON.stringify(service));
	
	
}).catch((err) => {
	console.log(err)
});

// http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/nodes
// http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/nodes/<node-name>
// http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/pods
// http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/namespace/<namespace-name>/pods/<pod-name>
