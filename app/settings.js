import ui, {$} from './lib/ui.js'
import request from './lib/request.js'

// Language and text size settings plus project info
export function Settings(l) {
    ui.init(this, l.str.settings)
    // Track previous change
    let prev

    this.load = async () => {
        const lang = request.cookie('lang') || 'fi'
        const size = request.cookie('size') || '10px'
        const theme = request.cookie('theme') || ''
        this.tree.innerHTML =
            '<h2>Kieli/Language</h2>' +
            '<p><button data-l="fi">suomi</button> <button data-l="en">english</button></p>' +
            `<h2>${l.str.size}</h2>` +
            `<p><button data-s="9px">${l.str.small}</button> <button data-s="10px">${l.str.medium}</button> <button data-s="11px">${l.str.large}</button></p>` +
            `<h2>${l.str.theme}</h2>` +
            `<p><button data-t="">${l.str.light}</button> <button data-t="dark">${l.str.dark}</button></p>` +
            `<h2>${l.str.dev}</h2>` +
            `<p>${l.str.src}: <a href="https://github.com/pfnisu/nysse-qtc/">https://github.com/pfnisu/nysse-qtc/</a></p>` +
            `<p>${l.str.api}: \u00a9 2025 <a href="https://digitransit.fi/en/developers/apis/7-terms-of-use/">Digitransit</a></p>` +
            `<h2>${l.str.license}</h2>` +
            '<p>Copyright \u00a9 2023-2025 Niko Suoniemi &lt;pfnisu@outlook.com&gt;</p>' +
            '<p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.</p>' +
            '<p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.</p>' +
            '<p>You should have received a copy of the GNU Affero General Public License along with this program. If not, see &lt;<a href="https://www.gnu.org/licenses/">https://www.gnu.org/licenses/</a>&gt;.</p>'
        // Mark current settings and previous change
        for (const b of
            $(`[data-l="${lang}"],[data-s="${size}"],[data-t="${theme}"]`, this, true)) {
            b.setAttribute('disabled', '')
            b.textContent += ' \u2713'
            // Needs double-negative so flip works in other views too
            if (!(prev && Object.keys(prev)[0] in b.dataset)) b.className = 'idle'
        }
    }

    // Use single listener for all settings
    this.tree.addEventListener('click', async (ev) => {
        prev = ev.target.dataset
        if (prev.l) {
            request.cookie('lang', prev.l)
            l.str = await request.http(`lang/${prev.l}.json`)
            this.name = l.str.settings
            ui.notify('lang')
            // Force update nav titles
            window.dispatchEvent(new Event('popstate'))
            this.load()
        } else if (prev.s) {
            request.cookie('size', prev.s)
            document.documentElement.style.setProperty('--size', prev.s)
            this.load()
        } else if ('t' in prev) {
            request.cookie('theme', prev.t)
            document.documentElement.className = prev.t
            this.load()
        }
    }, true)
}
