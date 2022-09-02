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

import { React } from 'webpkit';
import Dialog from 'webpkit/lib/dialog';

const FORMAT: Dict<string> = {
	'确定': 'Ok',
	'取消': 'Cancel',
}

export default class extends Dialog {

	protected renderButtons() {
		var buttons = this.props.buttons || { '@确定': (e)=>{} };
		var r = [];
		for (let i in buttons) {
			var t = i[0] == '@' ? i.substring(1) : i;
			var cls = i[0] == '@' ? 'btn_ act':'btn_';
			r.push(
				<div key={i} className={cls} onClick={()=>this._handleClick_1(buttons[i])}>{FORMAT[t] || t}</div>
			);
		}
		return r as any;
	}

	protected renderBody() {
		var props = this.props;
		return (
			<div className="dialog1">
				{
					props.prompt ?
					<div>
						<div className={typeof props.text == 'string' ? 'txt1': ''}>{props.text || ''}</div>
						{	(()=>{
							var Input = props.prompt.input;
							var type = props.prompt.type || 'text';
							var placeholder = props.prompt.placeholder || '';
							var inputProps = {
								ref: 'prompt',
								placeholder: placeholder,
								style: {
									border: 'solid 0.015rem #ccc',
									width: '90%',
									marginTop: '0.1rem',
									height: '0.5rem',
									padding: '0 2px',
								} as React.CSSProperties,
							};
							return (
								Input ? 
								<Input {...inputProps} value={props.prompt.value} type={type} initFocus={true} className="input1" />: 
								<input {...inputProps} defaultValue={props.prompt.value} type={type} className="input1" />
							);
						})()}
					</div>:
					<div className={typeof props.text == 'string' ? 'txt1': ''}>{props.text || ''}</div>
				}
				<div className="btns_">
					{this.renderButtons()}
				</div>
			</div>
		);
	}

}