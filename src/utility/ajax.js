import { throttle } from 'async-agent';
import axios from 'axios';
import { Queue } from 'type-enforcer';

const queue = new Queue();
const TYPE = {
	GET: 'get',
	PATCH: 'patch',
	PUT: 'put',
	POST: 'post',
	DELETE: 'delete'
};
let currentCallTotal = 0;

/**
 * Prioritize a new call
 * @function prioritizeCall
 * @arg {string} type
 * @arg {string} url
 * @arg {Object} settings
 */
const prioritizeCall = (type, url, settings = {}) => new Promise((resolve, reject) => {
	const handleResponse = (callback) => (value) => {
		currentCallTotal--;
		callback(value);
		checkPriorityQueue();
	};

	const call = () => {
		currentCallTotal++;

		axios[type](url, settings)
			.then(handleResponse((response) => {
				try {
					resolve(response.data);
				}
				catch (error) {
					reject(error, response.data);
				}
			}))
			.catch(handleResponse((error) => reject(error)));
	};

	if (settings.priority === 'low') {
		queue.add(call);
		checkPriorityQueue();
	}
	else {
		call();
	}
});

/**
 * See if there are any current calls and call the next prioritized call if appropriate.
 * @function checkPriorityQueue
 */
const checkPriorityQueue = throttle(() => {
	if (!currentCallTotal && queue.length) {
		queue.triggerFirst();
	}
}, 100, {
	leading: false
});

/**
 * Ajax utility.
 * @module ajax
 */
export default {
	/**
	 * Make an ajax call to get data.
	 * @method get
	 * @member module:ajax
	 * @static
	 * @arg {String} url - url to call
	 * @arg {Object} settings
	 */
	get: (url, settings) => prioritizeCall(TYPE.GET, url, settings),

	/**
	 * Make an ajax call to get data.
	 * @method get
	 * @member module:ajax
	 * @static
	 * @arg {String} url - url to call
	 * @arg {Object} settings
	 */
	patch: (url, settings) => prioritizeCall(TYPE.PATCH, url, settings),

	/**
	 * Make an ajax call to get data.
	 * @method get
	 * @member module:ajax
	 * @static
	 * @arg {String} url - url to call
	 * @arg {Object} settings
	 */
	put: (url, settings) => prioritizeCall(TYPE.PUT, url, settings),

	/**
	 * Make an ajax call to post data.
	 * @method post
	 * @member module:ajax
	 * @static
	 * @arg {String} url - url to call
	 * @arg {Object} settings
	 */
	post: (url, settings) => prioritizeCall(TYPE.POST, url, settings),

	/**
	 * Make an ajax call to delete data.
	 * @method delete
	 * @member module:ajax
	 * @static
	 * @arg {String} url - url to call
	 * @arg {Object} settings
	 */
	delete: (url, settings) => prioritizeCall(TYPE.DELETE, url, settings)
};
