import ui, {$} from './lib/ui.js'
import request from './lib/request.js'

// Language setting and project info
export function Settings(l) {
    ui.init(this, l.str.settings)
    // Track previous change
    let prev = null

    this.compose = async () => {
        const lang = request.cookie('lang') || 'fi'
        const size = request.cookie('size') || '10px'
        this.tree.innerHTML =
            '<h2>Kieli/Language</h2>' +
            '<p><button data-l="fi">suomi</button> <button data-l="en">english</button></p>' +
            `<h2>${l.str.size}</h2>` +
            `<p><button data-s="9px">${l.str.small}</button> <button data-s="10px">${l.str.medium}</button> <button data-s="11px">${l.str.large}</button></p>` +
            `<h2>${l.str.dev}</h2>` +
            `<p>${l.str.src}: <a href="https://github.com/pfnisu/nysse-qtc/">https://github.com/pfnisu/nysse-qtc/</a></p>` +
            `<p>${l.str.api}: &copy; 2024 <a href="https://digitransit.fi/en/developers/apis/6-terms-of-use/">Digitransit</a></p>` +
            `<h2>${l.str.license}</h2>` +
            '<p>Copyright &copy; 2023-2024 Niko Suoniemi &lt;niko@tamperelainen.org&gt;</p>' +
            '<p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.</p>' +
            '<p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.</p>' +
            '<p>You should have received a copy of the GNU Affero General Public License along with this program. If not, see &lt;<a href="https://www.gnu.org/licenses/">https://www.gnu.org/licenses/</a>&gt;.</p>'
        // Mark current settings and previous change
        for (const b of
            $(`[data-l="${lang}"],[data-s="${size}"]`, this, true)) {
            b.setAttribute('disabled', '')
            // Needs innerHTML to parse entity
            b.innerHTML += ' &#10003;'
            if (!prev || !(Object.keys(prev)[0] in b.dataset)) b.className = 'idle'
        }
    }

    // Use single listener for all settings
    this.tree.addEventListener('click', async (ev) => {
        prev = ev.target.dataset
        if (prev.l) {
            request.cookie('lang', prev.l)
            l.str = await request.http(`lang/${prev.l}.json`)
            this.title = l.str.settings
            ui.notify('lang')
            // Force update nav titles
            window.dispatchEvent(new Event('popstate'))
            this.compose()
        } else if (prev.s) {
            request.cookie('size', prev.s)
            document.documentElement.style.setProperty('--size', prev.s)
            this.compose()
        }
    }, true)
}
