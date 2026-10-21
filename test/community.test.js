import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSteamInputDbLayouts, mapQueryFilesLayouts, mapStoreSearchItems, parseJsLiteral } from "../core/community.js";

test("parses JS object literals without evaluating them", () => {
  const { value } = parseJsLiteral(
    `{a:1,"b":'two',c:[.5,-3,1e3,0x10,],d:void 0,e:null,f:true,g:\`tpl\`,h:new Date(0),i:someVar,"__proto__":{x:1}}`
  );
  assert.equal(value.a, 1);
  assert.equal(value.b, "two");
  assert.deepEqual(value.c, [0.5, -3, 1000, 16]);
  assert.equal(value.d, undefined);
  assert.equal(value.e, null);
  assert.equal(value.f, true);
  assert.equal(value.g, "tpl");
  assert.equal(value.h, "1970-01-01T00:00:00.000Z");
  assert.equal(value.i, undefined);
  assert.equal(Object.getPrototypeOf(value), Object.prototype);
  assert.deepEqual(value.__proto__, { x: 1 });
});

test("decodes string escapes", () => {
  const { value } = parseJsLiteral(String.raw`"a\nb\t\"c\" \u00e9 \x41 \u{1F3AE}"`);
  assert.equal(value, "a\nb\t\"c\" é A 🎮");
});

test("rejects executable expressions", () => {
  assert.throws(() => parseJsLiteral(`{a:this.constructor.constructor("return process")()}`));
  assert.throws(() => parseJsLiteral(`{a:fn()}`));
  assert.throws(() => parseJsLiteral("{a:`${x}`}"));
  assert.throws(() => parseJsLiteral(`{a:new Function("x")}`));
});

test("extracts layouts from a SteamInputDB page", () => {
  const html = `<html><script>
    const data = [null,{type:"data",data:{app:{id:620},configs:{items:[
      {title:"Gyro Aim",description:'Braces { } in "text"',file_id:"123",file_url:"https://cdn.steamusercontent.com/ugc/1/2/",
       controller_type:"controller_neptune",controller_type_nice:"Steam Deck",subscriptions:42,votes:{score:.93},
       tags:["fps","gyro_aim"],time_created:new Date(1700000000000)},
      {title:"No file",file_id:"456",file_url:void 0},
      null
    ],total:2},uses:{params:["appid"]}}}];
  </script></html>`;
  const layouts = extractSteamInputDbLayouts(html);
  assert.equal(layouts.length, 2);
  assert.equal(layouts[0].title, "Gyro Aim");
  assert.equal(layouts[0].description, 'Braces { } in "text"');
  assert.equal(layouts[0].file_url, "https://cdn.steamusercontent.com/ugc/1/2/");
  assert.equal(layouts[0].votes.score, 0.93);
  assert.deepEqual(layouts[0].tags, ["fps", "gyro_aim"]);
  assert.equal(layouts[0].time_created, "2023-11-14T22:13:20.000Z");
  assert.equal(layouts[1].file_url, null);
  assert.equal(layouts[1].subscriptions, 0);
});

test("returns no layouts for unexpected pages", () => {
  assert.deepEqual(extractSteamInputDbLayouts("<html>maintenance</html>"), []);
  assert.deepEqual(extractSteamInputDbLayouts(`configs:{items:[{title:evil()}]}`), []);
  assert.deepEqual(extractSteamInputDbLayouts(undefined), []);
});

test("maps store search results to apps only", () => {
  const items = mapStoreSearchItems({
    items: [
      { type: "app", id: 620, name: "Portal 2", metascore: "95", tiny_image: "x.jpg" },
      { type: "sub", id: 1, name: "Bundle" }
    ]
  });
  assert.deepEqual(items, [{ id: 620, name: "Portal 2", metascore: "95", tiny_image: "x.jpg" }]);
  assert.deepEqual(mapStoreSearchItems(null), []);
});

test("maps Steam QueryFiles controller layouts", () => {
  const layouts = mapQueryFilesLayouts({
    response: {
      total: 2,
      publishedfiledetails: [
        {
          publishedfileid: "2796168391",
          title: "Steam Deck Optimized + Gyro",
          file_description: "Gyro aim",
          file_url: "https://cdn.steamusercontent.com/ugc/1/A/",
          lifetime_subscriptions: 1200,
          vote_data: { score: 0.9, votes_up: 10, votes_down: 1 },
          tags: [{ tag: "controller_neptune" }, { tag: "feature_gyro" }, { tag: "hasactivators" }],
          time_updated: 1700000000
        },
        { publishedfileid: "1", result: 9 }
      ]
    }
  });
  assert.equal(layouts.length, 1);
  assert.equal(layouts[0].file_id, "2796168391");
  assert.equal(layouts[0].controller_type_nice, "Steam Deck");
  assert.deepEqual(layouts[0].tags, ["gyro"]);
  assert.equal(layouts[0].subscriptions, 1200);
  assert.equal(layouts[0].time_updated, "2023-11-14T22:13:20.000Z");
  assert.deepEqual(mapQueryFilesLayouts({}), []);
});
