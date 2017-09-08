/**
	首先在  new  promise 的时候，开始执行fn函数
	fn函数里有resolve方法，但是resolve方法有setTimeout方法，
	就会造成resolve方法延缓，
	就会先执行then方法，再回来执行resolve方法
	执行then方法的时候会把then参数赋值给 this的resolve方法，
	所以就会形成可以执行的resolve和reject方法

	链式调用是前一个then的return 回来的结果会给后一个then

	原理是then返回一个promise，并且这个promise的resolve的值是上一个then执行后返回的值

	如果一个then的函数里显式的返回一个promise对象，
	那么链式的下一个then方法是这个显式返回的promise的then方法

	那么实现它的时候，因为链式调用会自动返回一个promise，
	在显式的返回一个promise，会造成三层的promise嵌套，
	那么就需要把第二层的resolve和reject当成第三层的then的两个方法
	这样就会将第三层的resolve和reject 提升到第二层

	两个嵌套的promise，如果外层的resolve的value是个promise，
	那么外层的promise的then方法，实际上是内层resolve的promise的then方法
*/

/*
	promise的执行就是，promise里  resolve或者reject的值，会出现在then的函数的参数里
*/
function myPromise(fn) {
	this.value;
	this.status = 'pending';
	this.resolveFunc = function() {};
	this.rejectFunc = function() {};

	fn(this.resolve.bind(this), this.reject.bind(this));
}

myPromise.prototype.resolve = function(value) {
	this.value = value;

	var _self = this;

	if(this.status === 'pending') {
		this.status = 'resolved';

		if(value && typeof value.then === 'function') {
			setTimeout(function() {
				_self.resolveFunc(_self.value);
				value.then(_self.resolve);
			}, 0);
		}
		else {
			setTimeout(function() {
				_self.resolveFunc(_self.value);
			}, 0);
		}
	}
	
}

myPromise.prototype.reject = function(value) {
	this.value = value;

	var _self = this;

	if(this.status === 'pending') {
		this.status = 'rejected';
		setTimeout(function() {
			_self.rejectFunc(_self.value);
		}, 0);
	}
}

myPromise.prototype.then = function(resolveFunc, rejectFunc) {
	var _self = this;

	return new myPromise(function(resolve, reject) {
		function resolveWrap() {
			var result = resolveFunc(_self.value);
			if(result && typeof result.then === 'function') {
				result.then(resolve, reject);
			}
			else {
				resolve(result);
			}
		}
		function rejectWrap() {
			var result = rejectFunc(_self.value);
			if(result && typeof result.then === 'function') {
				result.then(resolve, reject);
			}
			else {
				reject(result);
			}
		}

		_self.resolveFunc = resolveWrap;
		_self.rejectFunc = rejectWrap;
	})
}


var a = 1;

var p2 = new myPromise(function(resolve, reject) {
	resolve('abcrfff');
});

var p = new myPromise(function(resolve, reject) {
	if(a > 0) {
		resolve(p2);
	}
	else {
		reject('bbb');
	}
});


p.then(function(res) {
	console.log(res);
	return new myPromise(function(resolve, reject) {
		resolve('mmm');
	})
}).then(function(res) {
	console.log('第二次', res);
	return res;
});


var obj = {
	a: function(){},
	b: 'abc'
};

Object.keys(obj).map(function(item) {
	console.log(item);
});


