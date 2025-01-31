import path from "path";
import { diffToProcedures } from "./diffToProcedures";
import { getDiffFromHead } from "./gitDifference";
import HttpClient from "./httpClient";
import { createDifsFromConfig } from "./integrationHandling";
import { logger } from "./loggingUtil";
import { proceduresToVanillaRequests } from "./proceduresToVanillaRequests";
import {
  directoryPromise,
  getAllSubChanges,
  PATH_OF_DIRECTORY_TO_WATCH,
} from "./utils";
import {
  deleteArticle,
  deleteKnowledgeCategory,
  getAllArticles,
  getKnowedgeCategories,
} from "./VanillaAPI";

// Main function to be used to use changes to markdown files merged to github to be converted
// to procedures that alter Vanillia forums
export const updateCommunityDocs = async () => {
  const diff = await getDiffFromHead();

  logger.info(`Diffs: ${diff}`);

  if (diff && diff.length) {
    const diffChanges = diff.trim().split("\n");
    const nested: string[] = [];

    for (let i = 0; i < diffChanges.length; i++) {
      const fullArrayOfAllItems: string[] = await getAllSubChanges(
        diffChanges[i]
      );

      fullArrayOfAllItems.forEach((item) => {
        nested.push(item);
      });
    }
    const nestedMergedWithOriginal = [...diffChanges, ...nested];
    // Add of article to staging for the changes that have occured
    if (process.env.targetVanillaEnv === "staging") {
      if (nestedMergedWithOriginal.indexOf("changes-from-update.md") === -1) {
        nestedMergedWithOriginal.push("changes-from-update.md");
      }
    }
    const nestedWithRemovedPath = nestedMergedWithOriginal.map((path) =>
      path.substring(path.indexOf(PATH_OF_DIRECTORY_TO_WATCH))
    );
    const procedures = await diffToProcedures(nestedWithRemovedPath);
    logger.info(
      `Procedures Count: ${JSON.stringify(procedures?.length, null, " ")}`
    );
    if (procedures && procedures.length > 0) {
      const completedProcedures = await proceduresToVanillaRequests({
        procedures: procedures || [],
      });

      logger.info(`Completed: ${completedProcedures}`);
      return completedProcedures;
    } else {
      logger.info(`Completed - no procedures generated`);
    }
  }
};

export const updateIntegrationArticles = async () => {
  const pathsArray = await createDifsFromConfig();

  if (process.env.targetVanillaEnv === "staging") {
    if (pathsArray.indexOf("changes-from-update.md") === -1) {
      pathsArray.push("changes-from-update.md");
    }
  }
  const filterPaths = pathsArray
    .filter((p) => p !== undefined)
    .map((p) => `knowledgeBase/${p}`);

  logger.info(`Updating: ${filterPaths}`);

  const procedures = await diffToProcedures(filterPaths);
  if (procedures && procedures.length > 0) {
    const completedProcedures = await proceduresToVanillaRequests({
      procedures: procedures || [],
      integrationsOnly: true,
    });
    logger.info(`Completed: ${completedProcedures}`);
    return completedProcedures;
  }
};

export const getAllItemsAsDiff = async () => {
  const fullArrayOfAllItems: string[] = await directoryPromise(
    path.join(__dirname, `../../../${PATH_OF_DIRECTORY_TO_WATCH}/`)
  );

  if (fullArrayOfAllItems) {
    const trimmedDirectories = fullArrayOfAllItems.map((result) =>
      result.substring(result.indexOf(PATH_OF_DIRECTORY_TO_WATCH))
    );
    if (process.env.targetVanillaEnv === "staging") {
      if (trimmedDirectories.indexOf("changes-from-update.md") === -1) {
        trimmedDirectories.push("changes-from-update.md");
      }
    }
    return trimmedDirectories;
  }
  return [];
};

// converts all items in the PATH_OF_DIRECTORY_TO_WATCH into Vanilla forum items
// Means that all article urls will change! web-Toolkit changes will be needed
export const updateVanillaWithDirectoryToWatch = async () => {
  const allAsDiff = await getAllItemsAsDiff();
  const procedures = await diffToProcedures(allAsDiff);

  if (procedures && procedures.length > 0) {
    return await proceduresToVanillaRequests({
      procedures,
    });
  }
};

// remove and rerun pipeline on all items
export const refreshVanillaItems = async () => {
  await deleteAllThingsCurrentlyOnVanillaForum();
  await updateVanillaWithDirectoryToWatch();
};

// Useful for when you need a clean slate.
// Removes Articles and Categories from Vanilla rather than having to click through their UI
export const deleteAllThingsCurrentlyOnVanillaForum = async () => {
  const httpClient = new HttpClient();
  const knowledgeCategories = await getKnowedgeCategories(httpClient);

  logger.info(`Getting Articles for DELETION`);
  const articles = await getAllArticles(httpClient, knowledgeCategories);
  for (let articleIndex = 0; articleIndex < articles.length; articleIndex++) {
    try {
      logger.info(`deleting Article:${articles[articleIndex]?.name}`);

      await deleteArticle(httpClient, articles[articleIndex].articleID);
    } catch (articleDeleteError) {
      logger.error(`DELETE ALL ARTICLE ERROR: \n ${articleDeleteError}`);
    }
  }

  for (
    let knowledgeCategoryIndex = 0;
    knowledgeCategoryIndex < knowledgeCategories.length;
    knowledgeCategoryIndex++
  ) {
    try {
      logger.info(
        `deleting item:${knowledgeCategories[knowledgeCategoryIndex].name}`
      );
      await deleteKnowledgeCategory(
        httpClient,
        knowledgeCategories[knowledgeCategoryIndex]
      );
    } catch (categoryDeleteError) {
      logger.error(`DELETE ALL Categories ERROR: \n ${categoryDeleteError}`);
    }
  }
};

export default updateCommunityDocs;
