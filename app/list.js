import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function List() {
    ui.init(this, 'list', false)

    this.compose = async () => {
        const query = {
            'query': `{
                routes(feeds: "tampere") {
                    shortName
                    longName
                }
            }`
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        this.tree.innerHTML =
            `<h1>Tampereen seudun joukkoliikenteen linjat</h1>
            <table></table>`
        const content = this.tree.querySelector('table')
        if (json) {
            json.data.routes.sort((a, b) => parseInt(a.shortName) - parseInt(b.shortName))
            for (const route of json.data.routes)
                content.innerHTML += 
                    `<tr>
                        <th>${route.shortName}</th>
                        <td>
                            <a href="#p=0;route=${route.shortName}">
                                ${route.longName}
                            </a>
                        </td>`
        } else content.innerHTML = '<td>Yhteysvirhe...</td>'
    }
}
