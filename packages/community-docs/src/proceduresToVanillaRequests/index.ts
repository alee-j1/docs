import HttpClient from "../httpClient";
import {
  getMarkdownImageSrcs,
  isSupportedMediaType,
  modifyBodyImageLink,
} from "../linksAndMediaHandlers";
import { Logger } from "../Logging";
import { isArticleType, isKnowledgeCategoryType } from "../utils";
import { createDisplayName } from "../utils/common";
import {
  FLAG_FOR_DELETE,
  KNOWN_CATEGORY_BEEN_DELETED,
  SHOULD_REALLY_UPLOAD_IMAGES,
} from "../utils/constants";
import { VanillaArticle, VanillaKnowledgeCategory } from "../utils/types";
import {
  createArticle,
  createKnowledgeCategory,
  deleteAllFlaggedCategories,
  deleteArticle,
  editArticle,
  getAllArticles,
  getKnowedgeCategories,
  uploadImageAndReturnUrl,
} from "../VanillaAPI";
import {
  directoryExists,
  kCategoriesByPathSize,
  markdownToString,
} from "./utils";
export const addVanillaCategoryToProcedure = (
  procedure: VanillaKnowledgeCategory,
  vanillaReturn: VanillaKnowledgeCategory[]
) => {
  const tempVanillaReturn: VanillaKnowledgeCategory[] = vanillaReturn || [];
  let procedureTarget: VanillaKnowledgeCategory = procedure;

  const match = tempVanillaReturn.filter(
    (v) => v.name === procedureTarget.name
  );
  if (match.length) {
    procedureTarget = {
      ...procedureTarget,
      knowledgeCategoryID: match[0].knowledgeCategoryID,
      parentID: match[0].parentID || 1,
      knowledgeBaseID: match[0].knowledgeBaseID,
      sortChildren: match[0].sortChildren,
      sort: match[0].sort,
      url: match[0].url,
      foreignID: match[0].foreignID,
    };
  }

  return procedureTarget;
};

export const addVanillaArticleInfoToProcedure = (
  procedure: VanillaArticle,
  vanillaArticles: VanillaArticle[]
): VanillaArticle => {
  let procedureTarget = procedure;

  const match = vanillaArticles.filter((v) => v.name === procedureTarget.name);

  if (match.length) {
    procedureTarget = {
      ...procedure,

      knowledgeCategoryID: match[0].knowledgeCategoryID,
      articleID: match[0].articleID,
      locale: "en",
      format: "markdown",
    };
  }

  return procedureTarget;
};

export const addVanillaArticlesToProcedures = (
  procedures: (VanillaArticle | VanillaKnowledgeCategory)[],
  vanillaArticles: VanillaArticle[]
) => {
  Logger.info(`Adding vanilla article information to procedures`);
  // const proceduresWithVanillaArticleInfo: (
  //   | VanillaArticle
  //   | VanillaKnowledgeCategory
  // )[] = [];
  const k = procedures.map((p) => {
    if (isArticleType(p)) {
      const articleWithVanilla = addVanillaArticleInfoToProcedure(
        p,
        vanillaArticles
      );

      return articleWithVanilla;
    } else {
      return p;
    }
  });

  return k;
  // console.log("WITH INFOOO", proceduresWithVanillaArticleInfo);
  // return proceduresWithVanillaArticleInfo;
};

export const uploadImagesAndAddToMarkdown = async (
  imageSrcArray: string[],
  markdownAsString: string
) => {
  Logger.info(`Uploading and adding images: ${imageSrcArray}`);
  let markdownTarget = markdownAsString;
  const supportedImages = imageSrcArray.filter((m) => isSupportedMediaType(m));
  for (let i = 0; i < supportedImages.length; i++) {
    if (SHOULD_REALLY_UPLOAD_IMAGES) {
      const newLocation = await uploadImageAndReturnUrl(supportedImages[i]);
      markdownTarget = modifyBodyImageLink(
        markdownTarget,
        supportedImages[i],
        newLocation
      );
    }
  }

  return markdownTarget;
};

export const addImagesToArticleMarkdown = async (markdownAsString: string) => {
  if (!markdownAsString || !markdownAsString.length) {
    return "";
  }
  const alteredMarkdown = markdownAsString;
  const imageSrcArray = getMarkdownImageSrcs(alteredMarkdown);
  if (!imageSrcArray.length) {
    return alteredMarkdown;
  } else {
    return await uploadImagesAndAddToMarkdown(imageSrcArray, markdownAsString);
  }
};

export const procedureToArticle = async (
  httpClient: HttpClient,
  procedureWorkedOn: VanillaArticle,
  previousknowledgeCategoryID: null | number
): Promise<VanillaArticle> => {
  const tempProcedureWorkedOn = { ...procedureWorkedOn };
  const bodyOfArticle = await markdownToString(tempProcedureWorkedOn?.path);
  tempProcedureWorkedOn.body = await addImagesToArticleMarkdown(bodyOfArticle);

  if (
    tempProcedureWorkedOn.articleID === null &&
    procedureWorkedOn.knowledgeCategoryID === null
  ) {
    if (!previousknowledgeCategoryID) {
      return tempProcedureWorkedOn;
    }

    tempProcedureWorkedOn.knowledgeCategoryID = previousknowledgeCategoryID;

    if (tempProcedureWorkedOn.body != FLAG_FOR_DELETE) {
      const articleRequest: Partial<VanillaArticle> = {
        body: tempProcedureWorkedOn.body,
        format: "markdown",
        knowledgeCategoryID: previousknowledgeCategoryID,
        locale: "en",
        name: tempProcedureWorkedOn.name,
        sort: 0,
      };
      const createdArticle = await createArticle(httpClient, articleRequest);

      if (createdArticle?.articleID) {
        return createdArticle;
      }
    }
  } else {
    if (
      tempProcedureWorkedOn.body !== FLAG_FOR_DELETE &&
      tempProcedureWorkedOn.articleID
    ) {
      const articleRequest: Partial<VanillaArticle> = {
        body: tempProcedureWorkedOn.body,
        format: "markdown",
        knowledgeCategoryID: previousknowledgeCategoryID,
        locale: "en",
        name: tempProcedureWorkedOn.name,
        sort: 0,
      };

      const editedArticle = await editArticle(
        httpClient,
        tempProcedureWorkedOn.articleID,
        articleRequest
      );

      if (editedArticle?.articleID) {
        return editedArticle;
      }
    }
    if (
      tempProcedureWorkedOn.body === FLAG_FOR_DELETE &&
      tempProcedureWorkedOn.articleID
    ) {
      const deletedArticle = await deleteArticle(
        httpClient,
        tempProcedureWorkedOn.articleID
      );

      if (deletedArticle) {
        return deletedArticle;
      }
    }
  }

  return tempProcedureWorkedOn;
};

export const procedureToKnowledgeCategory = async (
  httpClient: HttpClient,
  procedureWorkedOn: VanillaKnowledgeCategory,
  previousknowledgeCategoryID: null | number
): Promise<VanillaKnowledgeCategory> => {
  let tempProcedureWorkedOn = { ...procedureWorkedOn };
  const directoryExistsResult = directoryExists(tempProcedureWorkedOn?.path);

  if (tempProcedureWorkedOn.knowledgeCategoryID !== null) {
    if (directoryExistsResult) {
      return tempProcedureWorkedOn;
    } else {
      // kCategories get handled for delete later
      tempProcedureWorkedOn = {
        ...tempProcedureWorkedOn,
        description: FLAG_FOR_DELETE,
      };
    }
  } else {
    if (directoryExistsResult) {
      let reqData: any = {
        name: tempProcedureWorkedOn.name,
        parentID: 1,
      };
      if (previousknowledgeCategoryID !== null) {
        reqData = {
          name: tempProcedureWorkedOn.name,
          parentID: previousknowledgeCategoryID,
          knowledgeBaseID: 1,
        };
      }
      const createdKnowledgeCategory = await createKnowledgeCategory(
        httpClient,
        reqData
      );

      if (createdKnowledgeCategory) {
        tempProcedureWorkedOn = createdKnowledgeCategory;
      }
    } else {
      tempProcedureWorkedOn.description = KNOWN_CATEGORY_BEEN_DELETED;
    }
  }

  return tempProcedureWorkedOn;
};

export const removeDeletedCategories = async (
  httpClient: HttpClient,
  procedures: (VanillaArticle | VanillaKnowledgeCategory)[]
) => {
  Logger.info(`Removing deleted categories`);
  // at this point all vanillaArticles that need deleting should be deleted.
  const deletedKCategories: VanillaKnowledgeCategory[] = procedures.filter(
    isKnowledgeCategoryType
  );
  const kCategoriesByIncreasingPathSize =
    kCategoriesByPathSize(deletedKCategories);

  const categoriesDelete = await deleteAllFlaggedCategories(
    httpClient,
    kCategoriesByIncreasingPathSize
  );

  if (categoriesDelete) {
    return {
      categoriesDeleted: categoriesDelete,
      procedures,
    };
  }

  return {
    categoriesDeleted: categoriesDelete,
    procedures,
  };
};

export const getPreviousKnowledgeID = (
  completedProcedures: (VanillaArticle | VanillaKnowledgeCategory)[],
  procedureBeingWorkedOn: VanillaArticle | VanillaKnowledgeCategory,
  existingknowledgeCategoryInfo: VanillaKnowledgeCategory[]
): number | null => {
  const tempExistingknowledgeCategoryInfo =
    existingknowledgeCategoryInfo && existingknowledgeCategoryInfo.length
      ? [...existingknowledgeCategoryInfo]
      : [];

  const pathSplit = procedureBeingWorkedOn?.path?.split("/");

  if (pathSplit && procedureBeingWorkedOn?.fileName) {
    const indexInPath = pathSplit?.indexOf(procedureBeingWorkedOn?.fileName);

    if (indexInPath !== -1) {
      if (pathSplit[indexInPath - 1]) {
        const targetCategory = pathSplit[indexInPath - 1];
        const nameToLookFor = createDisplayName(targetCategory);

        const matches = tempExistingknowledgeCategoryInfo.filter(
          (c) =>
            c.name.trim().toLowerCase() === nameToLookFor.trim().toLowerCase()
        );

        if (matches && matches.length) {
          return matches[0].knowledgeCategoryID;
        }
      }
      if (indexInPath === 0) {
        const targetCategory = pathSplit[indexInPath];
        const nameToLookFor = createDisplayName(targetCategory);

        const matches = tempExistingknowledgeCategoryInfo.filter(
          (c) =>
            c.name.trim().toLowerCase() === nameToLookFor.trim().toLowerCase()
        );

        if (matches && matches.length) {
          return matches[0].knowledgeCategoryID;
        }
      }
    }
  }

  const tempCompletedProcedures = [...completedProcedures];
  const categoryOnlyProcedures: VanillaKnowledgeCategory[] =
    tempCompletedProcedures.filter(isKnowledgeCategoryType) || [];
  if (!categoryOnlyProcedures.length) {
    return null;
  }
  const lastCategoryInArray = categoryOnlyProcedures.pop();
  if (isArticleType(procedureBeingWorkedOn)) {
    return lastCategoryInArray?.knowledgeCategoryID || null;
  }
  if (
    lastCategoryInArray &&
    procedureBeingWorkedOn.fileName &&
    lastCategoryInArray.fileName
  ) {
    const indexOfLastCatFileName = procedureBeingWorkedOn.childrenPath.indexOf(
      lastCategoryInArray.fileName
    );

    if (indexOfLastCatFileName === -1) {
      return getPreviousKnowledgeID(
        categoryOnlyProcedures,
        procedureBeingWorkedOn,
        existingknowledgeCategoryInfo
      );
    }
    return lastCategoryInArray.knowledgeCategoryID;
  }

  return null;
};

export const useProceduresForVanillaRequests = async (
  procedures: (VanillaArticle | VanillaKnowledgeCategory)[],
  httpHandling: HttpClient,
  existingknowledgeCategoryInfo: VanillaKnowledgeCategory[],
  completedProcedures?: (VanillaArticle | VanillaKnowledgeCategory)[]
): Promise<(VanillaArticle | VanillaKnowledgeCategory)[]> => {
  const httpClient = httpHandling;
  const tempCompletedProcedures = completedProcedures
    ? [...completedProcedures]
    : [];
  const tempProcedures = [...procedures];
  const tempExistingKnowledgeCategoryInfo = [...existingknowledgeCategoryInfo];
  let previousknowledgeCategoryID = null;

  // this needs to be syncronous, going in order of the procedures.
  // for example - a new folder with a markdown file, we need to make a
  // new knowledgeCategory and use its id to create the new article
  let procedureWorkedOn = tempProcedures.shift();

  if (!procedureWorkedOn) {
    return tempCompletedProcedures;
  }

  previousknowledgeCategoryID = getPreviousKnowledgeID(
    tempCompletedProcedures,
    procedureWorkedOn,
    existingknowledgeCategoryInfo
  );

  const hasDonePrevFromVanilla: (VanillaArticle | VanillaKnowledgeCategory)[] =
    tempExistingKnowledgeCategoryInfo.filter((e) => {
      return e.name === procedureWorkedOn?.name;
    });
  const hasDonePrevFromCompletedProcedures: (
    | VanillaArticle
    | VanillaKnowledgeCategory
  )[] = tempCompletedProcedures.filter((e) => {
    return e.name === procedureWorkedOn?.name;
  });

  if (isKnowledgeCategoryType(procedureWorkedOn)) {
    if (
      hasDonePrevFromVanilla.length ||
      hasDonePrevFromCompletedProcedures.length
    ) {
      tempExistingKnowledgeCategoryInfo.push(procedureWorkedOn);
      previousknowledgeCategoryID =
        hasDonePrevFromVanilla[0].knowledgeCategoryID ||
        hasDonePrevFromVanilla[0].knowledgeCategoryID;
    } else {
      procedureWorkedOn = await procedureToKnowledgeCategory(
        httpClient,
        procedureWorkedOn,
        previousknowledgeCategoryID
      );
      tempExistingKnowledgeCategoryInfo.push(procedureWorkedOn);

      previousknowledgeCategoryID = procedureWorkedOn.knowledgeCategoryID;
      tempProcedures[0].knowledgeCategoryID = previousknowledgeCategoryID;
    }
  }
  if (isArticleType(procedureWorkedOn)) {
    procedureWorkedOn = await procedureToArticle(
      httpClient,
      procedureWorkedOn,
      previousknowledgeCategoryID
    );
  }

  tempCompletedProcedures.push(procedureWorkedOn);

  return await useProceduresForVanillaRequests(
    tempProcedures,

    httpHandling,
    tempExistingKnowledgeCategoryInfo,
    tempCompletedProcedures
  );
};

export const proceduresToVanillaRequests = async (
  procedures: (VanillaArticle | VanillaKnowledgeCategory)[]
) => {
  if (procedures && procedures.length) {
    const httpClient = new HttpClient();
    Logger.info(`Getting knowledgeCategories`);
    const existingknowledgeCategoryInfo = await getKnowedgeCategories(
      httpClient
    );

    Logger.info(`Getting Articles`);
    const articles = await getAllArticles(
      httpClient,
      existingknowledgeCategoryInfo
    );

    Logger.info(`Mapping Vanilla responses to procedures`);
    const proceduresWithVanillaCategories = procedures.map((p) => {
      if (isKnowledgeCategoryType(p)) {
        return addVanillaCategoryToProcedure(p, existingknowledgeCategoryInfo);
      }
      return p;
    });

    const proceduresWithArticleInfo = addVanillaArticlesToProcedures(
      proceduresWithVanillaCategories,
      articles
    );

    const proceduresNeedingDeleteCategories =
      await useProceduresForVanillaRequests(
        proceduresWithArticleInfo,
        httpClient,
        existingknowledgeCategoryInfo
      );

    const { procedures: finishedProcedures } = await removeDeletedCategories(
      httpClient,
      proceduresNeedingDeleteCategories
    );
    Logger.info(`FINISHED WITH PROCEDURES: ${finishedProcedures}`);
    return finishedProcedures;
  }
  Logger.info(`FINISHED WITH PROCEDURES: NONE`);
  return [];
};
