import ui from './lib/ui.js'
import request from './lib/request.js'

export function Settings(l) {
    ui.init(this, l.str.settings)

    this.compose = async () => {
        const lang = request.cookie('lang') || 'fi'
        this.tree.innerHTML =
            '<h2>Kieli/Language</h2>' +
            `<p><button id="fi">suomi</button> <button id="en">english</button></p>` +
            `<h2>${l.str.dev}</h2>` +
            `<p>${l.str.src}: <a href="https://github.com/pfnisu/nysse-qtc/">https://github.com/pfnisu/nysse-qtc/</a></p>` +
            `<p>${l.str.api}: &copy; 2024 <a href="https://digitransit.fi/en/developers/apis/6-terms-of-use/">Digitransit</a></p>` +
            `<h2>${l.str.license}</h2>` +
            '<p>Copyright &copy; 2023-2024 Niko Suoniemi &lt;niko@tamperelainen.org&gt;</p>' +
            '<p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.</p>' +
            '<p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.</p>' +
            '<p>You should have received a copy of the GNU Affero General Public License along with this program. If not, see &lt;<a href="https://www.gnu.org/licenses/">https://www.gnu.org/licenses/</a>&gt;.</p>'
        this.tree.querySelector(`#${lang}`).innerHTML += " &#10003;"
        this.tree.querySelector('p').addEventListener('click', async (ev) => {
            if (ev.target.id) {
                request.cookie('lang', ev.target.id)
                l.str = await request.http(`lang/${ev.target.id}.json`)
                this.title = l.str.settings
                this.notify()
                // Force update nav titles
                window.dispatchEvent(new Event('popstate'))
            }
        }, true)
    }
}
