/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2019, hardchain
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of hardchain nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL hardchain BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

import { ViewController, React, Link } from 'webpkit';
import { history } from 'webpkit/lib/router';
import {NFTAsset} from '../models/exchange';
import * as util from '../util';

export default class extends ViewController<{assets: NFTAsset}> {

	_go() {
		var {token, tokenId} = this.props.assets;
		history.push(`/details?token=${token}&tokenId=${tokenId}`);
	}

	render() {
		var {tokenURI, token, tokenId, selling, asset} = this.props.assets;
		// to={`/details?token=${token}&tokenId=${tokenId}`}
		return (
			<div className="nft_item" onClick={()=>this._go()}>
				<div className="img">
				{tokenURI.indexOf('.mp4') == -1 ?
					<img src={tokenURI} />:
					<video src={tokenURI} preload="auto" 
									autoPlay={true} loop={true} playsInline={true} webkit-playsinline="" 
									x5-playsinline="" style={{ width: '100%', height: '100%' }}></video>
					}
				</div>
				<div className="txt">{asset.name || String(tokenId)}</div>
				<div className="box1">
					<div className="txt2">{selling?util.price(selling.totalVotes): '-'}</div>
					<div className="txt4 txt7">{selling?'Votes': 'Unsold'}</div>
				</div>
				<div className="box1 box3">

					{selling?
					<div className="txt2">
						{util.price(selling.order.buyPrice)} 
						(${util.priceDollar(selling.order.buyPrice)})
					</div>:
					<div className="txt2">-</div>}

					{selling?
					<div className="txt4">Current offer by@{util.asAddress(selling?.order.bigBuyer)}</div>:
					<div className="txt4">Unsold</div>}
				</div>
				<div className="line1"></div>
				<div className="box2">
					<div className="txt5">ARTIST</div>
					<div className="txt6">{asset.artist || 'None'}</div>
				</div>
				<div className="box2 box3">
					<div className="txt5">OWNER</div>
					<div className="txt6">{asset.owner}</div>
				</div>
			</div>
		)
	}

}