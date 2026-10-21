// @ts-check
// Parsing of Steam responses that the proxy passes through verbatim.
// Runs in the browser and in Node (tests); no platform APIs are used.

/**
 * Maps the Steam store search JSON to the game list shown in the dialog.
 * @param {any} payload
 */
export function mapStoreSearchItems(payload) {
  if (!Array.isArray(payload?.items)) return [];
  return payload.items
    .filter((item) => item && item.type === "app")
    .map((item) => ({
      id: item.id,
      name: String(item.name ?? ""),
      metascore: item.metascore || "",
      tiny_image: item.tiny_image || ""
    }));
}

function asString(value) {
  return value == null ? "" : String(value);
}

/**
 * Maps Steam's IPublishedFileService/QueryFiles response for controller
 * layouts to the list shape the community dialog renders.
 * @param {any} payload
 */
export function mapQueryFilesLayouts(payload) {
  const files = payload?.response?.publishedfiledetails;
  if (!Array.isArray(files)) return [];
  return files
    .filter((file) => file && typeof file === "object" && file.result !== 9 && file.file_url)
    .map((file) => {
      const tags = Array.isArray(file.tags) ? file.tags.map((tag) => String(tag?.tag ?? tag)) : [];
      return {
        title: asString(file.title),
        description: asString(file.file_description),
        file_id: asString(file.publishedfileid),
        file_name: asString(file.filename),
        file_url: typeof file.file_url === "string" ? file.file_url : null,
        controller_type: tags.find((tag) => tag.startsWith("controller_")) ?? "",
        controller_type_nice: tags.includes("controller_neptune") ? "Steam Deck" : "",
        subscriptions: Number(file.lifetime_subscriptions ?? file.subscriptions ?? 0) || 0,
        votes: file.vote_data && typeof file.vote_data === "object" ? file.vote_data : {},
        // Feature tags ("feature_gyro") describe the layout; the rest is bookkeeping.
        tags: tags.filter((tag) => tag.startsWith("feature_")).map((tag) => tag.slice("feature_".length)),
        time_created: file.time_created ? new Date(Number(file.time_created) * 1000).toISOString() : "",
        time_updated: file.time_updated ? new Date(Number(file.time_updated) * 1000).toISOString() : ""
      };
    });
}
