import ui from './lib/ui.js'
import request from './lib/request.js'

// Language setting and project info
export function Settings(l) {
    ui.init(this, l.str.settings, false)
    // Track changed setting
    let setting = null

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
        // Apply current settings and animate last change
        for (const b of this.tree.querySelectorAll('button')) {
            if (b.dataset.l === lang || b.dataset.s === size) {
                b.setAttribute('disabled', '')
                // Needs innerHTML to parse entity
                b.innerHTML += ' &#10003;'
                for (const i in setting)
                    if (i in b.dataset && setting[i] === b.dataset[i])
                        b.className = 'switch'
            }
            setTimeout(() => b.className = '', 300)
        }
    }

    // Use single listener for all settings
    this.tree.addEventListener('click', async (ev) => {
        setting = ev.target.dataset
        if ('l' in setting) {
            request.cookie('lang', setting.l)
            l.str = await request.http(`lang/${setting.l}.json`)
            this.title = l.str.settings
            this.notify()
            // Force update nav titles
            window.dispatchEvent(new Event('popstate'))
            this.compose()
        } else if ('s' in setting) {
            request.cookie('size', setting.s)
            document.documentElement.style.setProperty('--size', setting.s)
            this.compose()
        }
    }, true)
}
