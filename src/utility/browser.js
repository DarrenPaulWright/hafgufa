import bowser from 'bowser';
import { castArray } from 'type-enforcer-ui';

const environment = bowser.parse(window.navigator.userAgent).platform.type;

export const IS_PHONE = environment === 'mobile';
export const IS_TABLET = environment === 'tablet';
export const IS_DESKTOP = environment === 'desktop';

export const cacheAssets = (assets) => new Promise((resolve, reject) => {
	caches.open('assets')
		.then((cache) => {
			cache.addAll(castArray(assets))
				.then(resolve)
				.catch(reject);
		})
		.catch(reject);
});
