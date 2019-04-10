import bowser from 'bowser';
import { castArray } from 'type-enforcer';

const env = bowser.parse(window.navigator.userAgent).platform.type;

export const IS_PHONE = env === 'mobile';
export const IS_TABLET = env === 'tablet';
export const IS_DESKTOP = env === 'desktop';

export const cacheAssets = (assets) => new Promise((resolve, reject) => {
	caches.open('assets')
		.then((cache) => {
			cache.addAll(castArray(assets))
				.then(resolve)
				.catch(reject);
		})
		.catch(reject);
});
