import bowser from 'bowser';
import { castArray } from 'type-enforcer';

export const IS_PHONE = bowser.mobile;
export const IS_TABLET = bowser.tablet;
export const IS_DESKTOP = !(IS_PHONE || IS_TABLET);

export const cacheAssets = (assets) => new Promise((resolve, reject) => {
	caches.open('assets')
		.then((cache) => {
			cache.addAll(castArray(assets))
				.then(resolve)
				.catch(reject);
		})
		.catch(reject);
});
