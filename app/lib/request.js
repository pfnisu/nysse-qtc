const re = (key) => new RegExp(`\\b${key}=([\\w]+)`)

export default {
    // cookie() Get or set cookie:
    //          Returns value string if cookie is found or set,
    //          otherwise null.
    // key      Cookie name
    // value    Optional cookie value:
    //          Get value if null, else set cookie to value.
    // age      Max-age in seconds, default = 60*60*24*365
    cookie: (key, value = null, age = 31536000) => {
        let match = ['', value]
        if (value !== null)
            document.cookie = `${key}=${value};Max-Age=${age};SameSite=Strict`
        else if (key)
            match = document.cookie.match(re(key))
        return match?.length > 1 ? match[1] : null
    },

    // hash()   Get or set parameters in URL hash:
    //          Returns value string or null.
    // key      Param name
    // value    Optional param value:
    //          Get value if null, remove param if empty string, else set value.
    // clear    Optional boolean to remove all previous params
    hash: (key, value = null, clear = false) => {
        let hash = clear ? '' : window.location.hash
        const match = hash.match(re(key)) || ['', value]
        if (value !== null) {
            hash = hash.replace(match[0], '')
            if (value !== '') hash += `;${key}=${value}`
            window.location.hash = hash.replace(/(?<=^|#|;);|;(?=$)/g, '')
        }
        return match[1]
    },

    // http()   Fetch as json, null on error
    // resource URI to fetch from
    // method   Optional method type, default = GET
    // data     Optional JSON payload to send in the request body
    // head     Optional HTTP headers as object, default Content-type = JSON
    http: async (resource, method = 'GET', data = null, head = {}) => {
        head['Content-type'] ??= 'application/json'
        try {
            let resp = await fetch(resource, {
                method: method,
                headers: head,
                body: data && JSON.stringify(data),
            })
            if (resp.ok) return await resp.json()
        } catch {
            return null
        }
    }
}
