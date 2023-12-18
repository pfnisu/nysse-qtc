import ui from './lib/ui.js'

export function Info() {
    ui.init(this, 'Info', false)
    this.compose = async () => {
        this.tree.innerHTML =
            '<h2>Palvelun kehittäjätiedot</h2>' +
            '<p>Lähdekoodi: <a href="https://github.com/pfnisu/nysse-qtc/">https://github.com/pfnisu/nysse-qtc/</a></p>' +
            '<p>Palvelu perustuu avoimeen dataan: <a href="https://digitransit.fi/">https://digitransit.fi/</a></p>' +
            '<h2>Ohjelmistolisenssi</h2>' +
            '<p>Copyright (C) 2023 Niko Suoniemi &lt;niko@tamperelainen.org&gt;</p>' +
            '<p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.</p>' +
            '<p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.</p>' +
            '<p>You should have received a copy of the GNU Affero General Public License along with this program. If not, see <a href="https://www.gnu.org/licenses/">https://www.gnu.org/licenses/</a></p>'
    }
}
