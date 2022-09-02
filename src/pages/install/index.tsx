
import {Page, React} from 'webpkit';
import * as cfg from '../../../config';
import './index.scss';

export default class extends Page {

	render() {
		return (
			<div className="install">{
				cfg.platform == 'eth'?
				<a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=chrome-ntp-icon">Install metamask wallet</a>:
				<a href="https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd">Install polkdot wallet</a>
			}
			</div>
		);
	}
}