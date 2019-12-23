export function setPipesService(pipesService) {
	this.pipesService = pipesService;
}

export function setPrefix(prefix) {
	this.prefix = prefix;
}

export function getData(type, params, callback) {
	this.pipesService.getDataSourceData(`${this.prefix}://fetchData?type=${type}&${params}`).then(data => {
		callback(true, data);
	})
	.catch(() => {
		callback(false);
	});	
}
