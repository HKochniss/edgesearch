const handlebars = require("handlebars");

module.exports = handlebars.compile(`
<html>
  <head>
    <meta charset="utf8">

    <title>Microsoft Jobs</title>
  </head>

  <body>
    <main>
      {{#each jobs}}
        <article>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1><a href={{URL}} target="_blank">{{title}}</a></h1>
              <h2>{{location}}</h2>
            </div>
            <div>
              <time datetime="{{date}}">{{date_formatted}}</time>
            </div>
          </div>
          <p>{{description}}</p>
        </article>
      {{/each}}
    </main>

    <aside>
      <form method="get">
        <h1>Keywords</h1>
        <input name="keywords" value="{{keywords}}">

        <h1>After</h1>
        <input type="datetime-local" name="after" value="{{after}}">
        </label>

        <h1>Rules</h1>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Expression</th>
              <th>Flags</th>
              <th>Field</th>
              <th>Invert</th>
              <th>Comment</th>
            </tr>
          </thead>

          <tbody id="rules-body">
            {{#each rules}}
              <tr>
                <td>
                  <select name="rules_enabled[]">
                    <option value="false" selected></option>
                    <option value="true" {{#if enabled}}selected{{/if}}>Enabled</option>
                  </select>
                </td>
                <td>
                  <input name="rules_expression[]" value="{{expression}}">
                </td>
                <td>
                  <input name="rules_flags[]" value="{{flags}}">
                </td>
                <td>
                  <input name="rules_field[]" value="{{field}}">
                </td>
                <td>
                  <select name="rules_invert[]">
                    <option value="false" selected></option>
                    <option value="true" {{#if invert}}selected{{/if}}>Invert</option>
                  </select>
                </td>
                <td>
                  <textarea name="rules_comment[]">{{comment}}</textarea>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>

        <template id="template-rule">
          <tr>
            <td>
              <select name="rules_enabled[]">
                <option value="false"></option>
                <option value="true" selected>Enabled</option>
              </select>
            </td>
            <td>
              <input name="rules_expression[]">
            </td>
            <td>
              <input name="rules_flags[]">
            </td>
            <td>
              <input name="rules_field[]">
            </td>
            <td>
              <select name="rules_invert[]">
                <option value="false" selected></option>
                <option value="true">Invert</option>
              </select>
            </td>
            <td>
              <textarea name="rules_comment[]"></textarea>
            </td>
          </tr>
        </template>

        <button type="button"
          onclick="document.querySelector('#rules-body').appendChild(
            document.querySelector('#template-rule').content.cloneNode(true)
          )"
        >Add rule</button>

        <button>Search</button>
      </form>
    </aside>
  </body>
</html>
`);
