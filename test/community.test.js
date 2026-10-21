import { test } from "node:test";
import assert from "node:assert/strict";
import { mapQueryFilesLayouts, mapStoreSearchItems } from "../core/community.js";

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
