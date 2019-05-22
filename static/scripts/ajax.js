/*************************************************************************
 *
 * BANDA CONFIDENTIAL
 * __________________
 *
 *  Copyright (C) 2019
 *  Banda Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Banda Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Banda Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Banda Incorporated.
 *
*************************************************************************/

function ajax_request(url, type, data, success, error) {
	$.ajax({
		url: url,
		type: type,
		data: data,
		success: success,
		error: (jgXHR, exception) => {
			switch(jgXHR.status) {
				case 401: case 403: case 500:
					error({ code: jgXHR.status, cause: jgXHR.responseText })
					break;
				default:
					console.error(`Failed to load resource: the server responded with a status of ${jgXHR.status} (${jgXHR.statusText}): ${jgXHR.responseText}`)
			}
		}
	})
	// Failed to load resource: the server responded with a status of 400 (Bad Request)
}

function post_request(url, data, success, error) {
	ajax_request(url, 'POST', data, success, error)
}

function get_request(url, data, success, error) {
	ajax_request(url, 'GET', data, success, error)
}

function redirect_to(url) {
	// this acts as if a user clicked a link
	// for a redirect, use `window.location.replace(url)`
	window.location.href = url;
}
