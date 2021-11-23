import {
  FLAG_FOR_DELETE,
  KNOWN_CATEGORY_BEEN_DELETED,
  ProcedureTypeEnum,
  VanillaArticle,
  VanillaKnowledgeCategory,
} from "../utils";
import {
  createArticle,
  createKnowledgeCategory,
  deleteAllFlaggedCategories,
  deleteArticle,
  editArticle,
  editKnowledgeCategory,
} from "../VanillaAPI";
import {
  addImagesToArticleMarkdown,
  addVanillaArticleInfoToProcedure,
  addVanillaArticlesToProcedures,
  addVanillaCategoryToProcedure,
  getPreviousKnowledgeID,
  procedureToArticle,
  procedureToKnowledgeCategory,
  removeDeletedCategories,
  useProceduresForVanillaRequests,
} from "./";
import {
  childVanillaKnowledgeCategory,
  expectedDeleteANDCreatesPROCEDURES,
  matchingProcedureKnowledgeCategory,
  matchingVanillaKnowledgeArticle,
  procedureArticle,
  procedureKnowledgeCategory,
  PROCEDURES,
  PROCEDURESKCategoriesDELETED,
  proceduresMock,
  PROCEDURESWithKCategoriesToDelete,
  PROCEDURESWithOneDeleteArticleAndCreates,
  SHAPEWEWANT,
  vanillaArticleWithInfo,
  vanillaKnowledgeArticle,
  vanillaKnowledgeCategory,
} from "./mocks";
import { directoryExists, markdownToString } from "./utils";
jest.mock("../VanillaAPI");
jest.mock("./utils");

describe("ProceduresToVanillaRequests", () => {
  let mockCreateKnowledgeCategory =
    createKnowledgeCategory as jest.MockedFunction<
      typeof createKnowledgeCategory
    >;
  let mockMarkdownToString = markdownToString as jest.MockedFunction<
    typeof markdownToString
  >;
  let mockDirectoryExists = directoryExists as jest.MockedFunction<
    typeof directoryExists
  >;
  let mockEditKnowledgeCategory = editKnowledgeCategory as jest.MockedFunction<
    typeof editKnowledgeCategory
  >;
  // let mockDeleteKnowledgeCategory =
  //   deleteKnowledgeCategory as jest.MockedFunction<
  //     typeof deleteKnowledgeCategory
  //   >;
  let mockDeleteAllFlaggedCategories =
    deleteAllFlaggedCategories as jest.MockedFunction<
      typeof deleteAllFlaggedCategories
    >;

  let mockCreateArticle = createArticle as jest.MockedFunction<
    typeof createArticle
  >;
  let mockEditArticle = editArticle as jest.MockedFunction<typeof editArticle>;
  let mockDeleteArticle = deleteArticle as jest.MockedFunction<
    typeof deleteArticle
  >;
  let matchingVanillaKnowledgeArticletemp = matchingVanillaKnowledgeArticle;
  let vanillaKnowledgeArticletemp = vanillaKnowledgeArticle;
  let procedureArticletemp = procedureArticle;
  let vanillaKnowledgeCategorytemp = vanillaKnowledgeCategory;
  let procedureKnowledgeCategorytemp = procedureKnowledgeCategory;
  let matchingProcedureKnowledgeCategorytemp =
    matchingProcedureKnowledgeCategory;
  let proceduresMocktemp = proceduresMock;

  beforeEach(() => {
    mockDirectoryExists.mockReturnValue(true);
    mockCreateArticle = createArticle as jest.MockedFunction<
      typeof createArticle
    >;
    mockMarkdownToString = markdownToString as jest.MockedFunction<
      typeof markdownToString
    >;
    mockDirectoryExists = directoryExists as jest.MockedFunction<
      typeof directoryExists
    >;
    // mockDeleteKnowledgeCategory =
    //   deleteKnowledgeCategory as jest.MockedFunction<
    //     typeof deleteKnowledgeCategory
    //   >;
    mockDeleteAllFlaggedCategories =
      deleteAllFlaggedCategories as jest.MockedFunction<
        typeof deleteAllFlaggedCategories
      >;
    mockEditKnowledgeCategory = editKnowledgeCategory as jest.MockedFunction<
      typeof editKnowledgeCategory
    >;
    mockCreateKnowledgeCategory =
      createKnowledgeCategory as jest.MockedFunction<
        typeof createKnowledgeCategory
      >;
    mockEditArticle = editArticle as jest.MockedFunction<typeof editArticle>;
    mockDeleteArticle = deleteArticle as jest.MockedFunction<
      typeof deleteArticle
    >;
    matchingVanillaKnowledgeArticletemp = matchingVanillaKnowledgeArticle;
    vanillaKnowledgeArticletemp = vanillaKnowledgeArticle;
    procedureArticletemp = procedureArticle;
    vanillaKnowledgeCategorytemp = vanillaKnowledgeCategory;
    procedureKnowledgeCategorytemp = procedureKnowledgeCategory;
    matchingProcedureKnowledgeCategorytemp = matchingProcedureKnowledgeCategory;
    proceduresMocktemp = proceduresMock;
  });
  describe("addVanillaCategoryToProcedure", () => {
    it("returns the procedure if no match from vanilla return", () => {
      const expected = procedureKnowledgeCategorytemp;
      const actual = addVanillaCategoryToProcedure(
        procedureKnowledgeCategorytemp,
        [vanillaKnowledgeCategorytemp]
      );

      expect(actual).toEqual(expected);
    });
    it("returns addition of knowledge return to the procedure", () => {
      const expected = {
        childrenPath: "compliance-reporting",
        description: "",
        fileName: "compliance-reporting",
        foreignID: undefined,
        knowledgeBaseID: 1,
        knowledgeCategoryID: 23,
        name: "Compliance Reporting",
        parentID: 8,
        path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
        procedureType: "Category",
        sort: undefined,
        sortChildren: undefined,
        url: undefined,
      };
      const actual = addVanillaCategoryToProcedure(
        matchingProcedureKnowledgeCategorytemp,
        [vanillaKnowledgeCategorytemp]
      );

      expect(actual).toEqual(expected);
    });
  });

  describe("addVanillaArticleToProcedure", () => {
    it("returns the procedure if no match from vanilla return", () => {
      const expected = procedureArticletemp;
      const actual = addVanillaArticleInfoToProcedure(procedureArticletemp, [
        vanillaKnowledgeArticletemp,
      ]);

      expect(actual).toEqual(expected);
    });
    it("returns addition of knowledge return to the procedure", () => {
      const expected = {
        articleID: 43,
        body: "",
        fileName: "soc2-with-jupiterone-copy.md",
        format: "markdown",
        knowledgeCategoryID: 22,
        locale: "en",
        name: "Soc2 With Jupiterone Copy",
        path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
        procedureType: "Article",
      };
      const actual = addVanillaArticleInfoToProcedure(procedureArticletemp, [
        matchingVanillaKnowledgeArticletemp,
      ]);

      expect(actual).toEqual(expected);
    });
  });
  describe("addVanillaArticlesToProcedures", () => {
    it("return proceduresWithVanillaCategoryInfo", () => {
      const expected = [
        {
          childrenPath: "getting-started-admin",
          description: "",
          fileName: "getting-started-admin",
          knowledgeBaseID: 1,
          knowledgeCategoryID: null,
          name: "Getting Started Admin",
          parentID: null,
          path: "getting-started-admin/jupiterone-query-language-copy.md",
          procedureType: "Category",
        },
        {
          articleID: null,
          body: "",
          fileName: "jupiterone-query-language-copy.md",
          format: "markdown",
          knowledgeCategoryID: null,
          locale: "en",
          name: "Jupiterone Query Language Copy",
          path: "getting-started-admin/jupiterone-query-language-copy.md",
          procedureType: "Article",
        },
        {
          articleID: null,
          body: "",
          fileName: "jupiterone-query-language.md",
          format: "markdown",
          knowledgeCategoryID: null,
          locale: "en",
          name: "Jupiterone Query Language",
          path: "getting-started-admin/jupiterone-query-language.md",
          procedureType: "Article",
        },
        {
          childrenPath: "compliance-reporting",
          description: "",
          fileName: "compliance-reporting",
          knowledgeBaseID: 1,
          knowledgeCategoryID: null,
          name: "Compliance Reporting",
          parentID: null,
          path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
          procedureType: "Category",
        },
        {
          articleID: 43,
          body: "",
          fileName: "soc2-with-jupiterone-copy.md",
          format: "markdown",
          knowledgeCategoryID: 22,
          locale: "en",
          name: "Soc2 With Jupiterone Copy",
          path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
          procedureType: "Article",
        },
        {
          articleID: null,
          body: "",
          fileName: "soc2-with-jupiterone.md",
          format: "markdown",
          knowledgeCategoryID: null,
          locale: "en",
          name: "Soc2 With Jupiterone",
          path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone.md",
          procedureType: "Article",
        },
      ];
      const actual = addVanillaArticlesToProcedures(proceduresMocktemp, [
        matchingVanillaKnowledgeArticletemp,
      ]);
      expect(actual).toEqual(expected);
    });
  });
  describe("procedureToArticle", () => {
    describe("Creating new vanilla article", () => {
      it("returns procedure when previous knowledgeCategoryId doesnt exist", async () => {
        const procedureWithNoArticle = procedureArticletemp;
        mockCreateArticle.mockResolvedValue({
          articleID: null,
        } as any);
        const mockHttpclient = {} as any;
        const actual = await procedureToArticle(
          mockHttpclient,
          procedureWithNoArticle,
          null
        );
        expect(actual).toEqual({
          articleID: null,
          body: "",
          fileName: "soc2-with-jupiterone-copy.md",
          format: "markdown",
          knowledgeCategoryID: null,
          locale: "en",
          name: "Soc2 With Jupiterone Copy",
          path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
          procedureType: "Article",
        });
        expect(mockCreateArticle).toHaveBeenCalledTimes(0);
      });
      it("creates new Article and adds vanilla info to procedure", async () => {
        const procedureWithNoArticle = procedureArticletemp;
        const previousknowledgeCategoryID = 26;
        const articleID = 26;
        mockCreateArticle.mockReset();
        mockCreateArticle.mockResolvedValue({
          articleID,
          name: "Soc2 With Jupiterone Copy",
          knowledgeCategoryID: previousknowledgeCategoryID,
        } as any);
        const mockHttpclient = {} as any;
        const actual = await procedureToArticle(
          mockHttpclient,
          procedureWithNoArticle,
          previousknowledgeCategoryID
        );

        expect(actual).toEqual({
          articleID,
          body: "",
          fileName: "soc2-with-jupiterone-copy.md",
          format: "markdown",
          knowledgeCategoryID: previousknowledgeCategoryID,
          locale: "en",
          name: "Soc2 With Jupiterone Copy",
          path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
          procedureType: "Article",
        });
        expect(mockCreateArticle).toHaveBeenCalledWith(mockHttpclient, {
          body: "",
          format: "markdown",
          knowledgeCategoryID: articleID,
          locale: "en",
          name: "Soc2 With Jupiterone Copy",
          sort: 0,
        });
      });
    });
    describe("Editing existing vanilla article", () => {
      beforeEach(() => {
        mockEditArticle.mockReset();
      });
      it("edits an existing article", async () => {
        const previousknowledgeCategoryID = 28;
        const articleID = 55;
        const procedureWithArticle = {
          ...procedureArticletemp,
          articleID,
          knowledgeCategoryID: previousknowledgeCategoryID,
        };
        const mockHttpclient = {} as any;
        mockEditArticle.mockResolvedValue({
          articleID,
          name: "Soc2 With Jupiterone Copy",
          knowledgeCategoryID: previousknowledgeCategoryID,
        } as any);
        const actual = await procedureToArticle(
          mockHttpclient,
          procedureWithArticle,
          previousknowledgeCategoryID
        );
        expect(actual).toEqual({
          knowledgeCategoryID: previousknowledgeCategoryID,
          articleID,
          fileName: "soc2-with-jupiterone-copy.md",
          name: "Soc2 With Jupiterone Copy",
          body: "",
          path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
          format: "markdown",
          locale: "en",
          procedureType: "Article",
        });
        expect(mockEditArticle).toHaveBeenCalledWith(
          mockHttpclient,
          articleID,
          {
            body: "",
            format: "markdown",
            knowledgeCategoryID: previousknowledgeCategoryID,
            locale: "en",
            name: "Soc2 With Jupiterone Copy",
            sort: 0,
          }
        );
      });
    });
    describe("Deleting existing vanilla article", () => {
      beforeEach(() => {
        mockDeleteArticle.mockReset();
      });
      it("deletes existing article when body contains delete flag", async () => {
        mockDeleteArticle.mockResolvedValue({} as any);
        mockMarkdownToString.mockResolvedValue(FLAG_FOR_DELETE);
        const articleID = 234;
        const previousknowledgeCategoryID = 8;
        const mockHttpclient = {} as any;
        const procedureWithArticle = {
          ...procedureArticletemp,
          articleID,
          knowledgeCategoryID: previousknowledgeCategoryID,
        };
        const actual = await procedureToArticle(
          mockHttpclient,
          procedureWithArticle,
          previousknowledgeCategoryID
        );
        expect(actual).toEqual({
          articleID: 234,
          body: "FILE_DOES_NOT_EXIST",
          fileName: "soc2-with-jupiterone-copy.md",
          format: "markdown",
          knowledgeCategoryID: 8,
          locale: "en",
          name: "Soc2 With Jupiterone Copy",
          path: "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
          procedureType: "Article",
        });
        expect(mockDeleteArticle).toHaveBeenCalledWith(
          mockHttpclient,
          articleID
        );
      });
    });
  });
  describe("deleteAllFlaggedCategories", () => {
    beforeEach(() => {
      mockDeleteAllFlaggedCategories.mockReset();
    });
    it("returns obj with procedures, categoriesDeleted", async () => {
      mockDeleteAllFlaggedCategories.mockResolvedValue(
        PROCEDURESKCategoriesDELETED
      );
      const expected = {
        procedures: PROCEDURESWithKCategoriesToDelete,
        categoriesDeleted: PROCEDURESKCategoriesDELETED,
      };
      const mockHttpclient = {} as any;
      const actual = await removeDeletedCategories(
        mockHttpclient,
        PROCEDURESWithKCategoriesToDelete
      );
      expect(actual).toEqual(expected);
    });
    it("handles empty array", async () => {
      const noneToDelete: VanillaKnowledgeCategory[] = [];
      mockDeleteAllFlaggedCategories.mockResolvedValue(noneToDelete as any);
      const expected = {
        procedures: PROCEDURESWithKCategoriesToDelete,
        categoriesDeleted: noneToDelete,
      };
      const mockHttpclient = {} as any;
      const actual = await removeDeletedCategories(
        mockHttpclient,
        PROCEDURESWithKCategoriesToDelete
      );
      expect(actual).toEqual(expected);
      expect(PROCEDURESWithKCategoriesToDelete).toEqual(actual.procedures);
    });
  });
  describe("procedureToKnowledgeCategory", () => {
    beforeEach(() => {
      mockCreateKnowledgeCategory.mockReset();
    });
    it("Creates", async () => {
      mockDirectoryExists.mockReturnValue(true);
      const procedureKnowledgeCategoryNOKCID = {
        ...procedureKnowledgeCategorytemp,
      };
      const knowledgeCategoryID = 111;
      mockCreateKnowledgeCategory.mockResolvedValue({
        ...procedureKnowledgeCategoryNOKCID,
        knowledgeCategoryID,
      });
      const expected = {
        childrenPath:
          "getting-started-admin/soc2-reporting/soc2-with-jupiterone-copy.md",
        description: "",
        fileName: "soc2-reporting",
        foreignID: undefined,
        knowledgeBaseID: 1,
        knowledgeCategoryID,
        name: "Soc2 Reporting",
        parentID: 1,
        path: "getting-started-admin/soc2-reporting",
        procedureType: "Category",
        sort: undefined,
        sortChildren: undefined,
        url: undefined,
      };
      const mockHttpclient = {} as any;
      const actual = await procedureToKnowledgeCategory(
        mockHttpclient,
        procedureKnowledgeCategoryNOKCID,
        22
      );
      expect(mockCreateKnowledgeCategory).toHaveBeenLastCalledWith(
        mockHttpclient,
        {
          name: "Soc2 Reporting",
          parentID: 22,
        }
      );
      expect(actual).toEqual(expected);
    });
    describe("Edits", () => {
      beforeEach(() => {
        mockEditKnowledgeCategory.mockReset();
        mockDirectoryExists.mockReturnValue(true);
      });
      it("returns procedure when file exists and has knowledgeCategoryID", async () => {
        const knowledgeCategoryID = 111;
        mockDirectoryExists.mockReturnValue(true);
        const procedureKnowledgeCategoryWITHKCID = {
          ...procedureKnowledgeCategorytemp,
          knowledgeCategoryID,
        };

        mockEditKnowledgeCategory.mockResolvedValue({
          ...procedureKnowledgeCategoryWITHKCID,
          knowledgeCategoryID,
        });
        const expected = procedureKnowledgeCategoryWITHKCID;
        const mockHttpclient = {} as any;
        const actual = await procedureToKnowledgeCategory(
          mockHttpclient,
          procedureKnowledgeCategoryWITHKCID,
          22
        );

        expect(actual).toEqual(expected);
      });
    });
    describe("Delete", () => {
      it(" Marks kcategories for delete when kcategory file does not exist", async () => {
        const knowledgeCategoryID = 111;
        mockDirectoryExists.mockReturnValue(false);
        const procedureKnowledgeCategoryNOKCID = {
          ...procedureKnowledgeCategorytemp,
          knowledgeCategoryID,
          path: "getting-started-admin/soc2-repzzzorting/soc2-with-jupiterone-copy.md",
        };
        const mockHttpclient = {} as any;
        const actual = await procedureToKnowledgeCategory(
          mockHttpclient,
          procedureKnowledgeCategoryNOKCID,
          22
        );

        expect(actual.description).toEqual(FLAG_FOR_DELETE);
      });
      it(" Marks kcategories AS deleted when missing kcategory file and knowledgeCategoryID", async () => {
        const knowledgeCategoryID = null;
        mockDirectoryExists.mockReturnValue(false);
        const procedureKnowledgeCategoryNOKCID = {
          ...procedureKnowledgeCategorytemp,
          knowledgeCategoryID,
          path: "getting-started-admin/soc2-repzzzorting/soc2-with-jupiterone-copy.md",
        };
        const mockHttpclient = {} as any;
        const actual = await procedureToKnowledgeCategory(
          mockHttpclient,
          procedureKnowledgeCategoryNOKCID,
          22
        );

        expect(actual.description).toEqual(KNOWN_CATEGORY_BEEN_DELETED);
      });
    });
  });

  describe("getPreviousKnowledgeID", () => {
    it("returns null when there is no previous knowledge category", () => {
      const expected = null;
      const actualWithEmptyArray = getPreviousKnowledgeID(
        [],
        vanillaKnowledgeCategory
      );
      const actualWithNoCategories = getPreviousKnowledgeID(
        [vanillaArticleWithInfo, vanillaArticleWithInfo],
        childVanillaKnowledgeCategory
      );
      expect(actualWithEmptyArray).toEqual(expected);
      expect(actualWithNoCategories).toEqual(expected);
    });
    it("returns knowledgeCategoryID of nearest Category", () => {
      const knowledgeCategoryID = 827;
      const targetForKnowledgeCategory = {
        ...vanillaKnowledgeCategory,
        knowledgeCategoryID,
      };
      const expected = knowledgeCategoryID;
      const actualWithEmptyArray = getPreviousKnowledgeID(
        [
          vanillaKnowledgeCategory,
          vanillaArticleWithInfo,
          targetForKnowledgeCategory,
          vanillaArticleWithInfo,
        ],
        childVanillaKnowledgeCategory
      );

      expect(actualWithEmptyArray).toEqual(expected);
    });
    it("returns knowledgeCategoryID of next category with matching patch", () => {
      const nearestParentCategory = {
        parentID: 1,
        knowledgeBaseID: 1,
        name: "Getting Started Admin",
        fileName: "getting-started-admin",
        description: "",
        knowledgeCategoryID: 49,
        path: "getting-started-admin",
        childrenPath: "getting-started-admin/jupiterone-query-language-copy.md",
        procedureType: "Category",
        sortChildren: null,
        sort: 0,
        url: "",
        foreignID: null,
      } as VanillaKnowledgeCategory;
      const tester = {
        parentID: 1,
        knowledgeBaseID: 1,
        name: "Rock",
        fileName: "rock",
        description: "",
        knowledgeCategoryID: null,
        path: "getting-started-admin/rock",
        childrenPath: "getting-started-admin/rock/rolls.md",
        procedureType: "Category",
        sortChildren: null,
        sort: 0,
        url: "",
        foreignID: null,
      } as VanillaKnowledgeCategory;
      const cousinNotParent = {
        parentID: 8,
        knowledgeBaseID: 1,
        name: "Compliance Reporting",
        fileName: "compliance-reporting",
        description: "",
        knowledgeCategoryID: 23,
        path: "getting-started-admin/compliance-reporting",
        childrenPath:
          "getting-started-admin/compliance-reporting/soc2-with-jupiterone-copy.md",
        procedureType: ProcedureTypeEnum.Category,
      } as VanillaKnowledgeCategory;

      const returnedId = getPreviousKnowledgeID(
        [nearestParentCategory, cousinNotParent],
        tester
      );

      expect(returnedId).toEqual(49);
    });
  });

  describe("useProceduresForVanillaRequests", () => {
    beforeEach(() => {
      mockMarkdownToString.mockReset();
      mockCreateArticle.mockReset();
      mockCreateKnowledgeCategory.mockReset();
    });
    it("handles all new items", async () => {
      mockDirectoryExists.mockReturnValue(true);
      mockMarkdownToString.mockResolvedValue("Im markdown. LOOK AT ME.");
      mockCreateArticle
        .mockResolvedValueOnce({
          ...vanillaArticleWithInfo,
          knowledgeCategoryID: 22,
          articleID: 11,
          name: "Jupiterone Query Language Copy",
        })
        .mockResolvedValueOnce({
          ...vanillaArticleWithInfo,
          knowledgeCategoryID: 22,
          articleID: 12,

          name: "Jupiterone Query Language",
        })
        .mockResolvedValueOnce({
          ...vanillaArticleWithInfo,
          knowledgeCategoryID: 33,
          articleID: 21,
          name: "Soc2 With Jupiterone Copy",
        })
        .mockResolvedValueOnce({
          ...vanillaArticleWithInfo,
          knowledgeCategoryID: 33,
          articleID: 22,

          name: "Soc2 With Jupiterone",
        });
      mockCreateKnowledgeCategory
        .mockResolvedValueOnce({
          ...vanillaKnowledgeCategory,
          parentID: 1,
          knowledgeBaseID: 1,
          name: "Getting Started Admin",
          description: "",
          knowledgeCategoryID: 22,
        })

        .mockResolvedValueOnce({
          ...vanillaKnowledgeCategory,
          parentID: 22,
          knowledgeBaseID: 1,
          name: "Compliance Reporting",

          knowledgeCategoryID: 33,
        });

      const actual = await useProceduresForVanillaRequests(PROCEDURES, []);

      expect(actual).toEqual(SHAPEWEWANT);
    });
    it("handles addition and removal of an articles", async () => {
      mockDirectoryExists.mockReturnValue(true);
      const editArticle =
        PROCEDURESWithOneDeleteArticleAndCreates[2] as VanillaArticle;
      const deleteArticle =
        PROCEDURESWithOneDeleteArticleAndCreates[1] as VanillaArticle;
      mockMarkdownToString
        .mockResolvedValueOnce(FLAG_FOR_DELETE)
        .mockResolvedValue("Im markdown. LOOK AT ME.");
      mockEditArticle.mockResolvedValue(editArticle);
      mockDeleteArticle.mockResolvedValue(deleteArticle);
      mockCreateArticle
        .mockResolvedValueOnce({
          ...vanillaArticleWithInfo,
          knowledgeCategoryID: 33,
          articleID: 21,
          name: "Soc2 With Jupiterone Copy",
        })
        .mockResolvedValueOnce({
          ...vanillaArticleWithInfo,
          knowledgeCategoryID: 33,
          articleID: 22,
          name: "Soc2 With Jupiterone",
        });
      mockCreateKnowledgeCategory.mockResolvedValueOnce({
        ...vanillaKnowledgeCategory,
        parentID: 22,
        knowledgeBaseID: 1,
        name: "Compliance Reporting",
        knowledgeCategoryID: 33,
      });

      const actual = await useProceduresForVanillaRequests(
        PROCEDURESWithOneDeleteArticleAndCreates,
        []
      );

      expect(actual).toEqual(expectedDeleteANDCreatesPROCEDURES);
    });
  });
  describe("addImagesToArticleMarkdown", () => {
    it("returns empty string when no input supplied", async () => {
      const actual = await addImagesToArticleMarkdown("");
      const expected = "";
      expect(actual).toEqual(expected);
    });
    it("returns inputted string when length of imageSrcMap is 0", async () => {
      const inputedString =
        "markdown turned into a string and does not contain ()[assets/images]";
      const actual = await addImagesToArticleMarkdown(inputedString);
      const expected = inputedString;
      expect(actual).toEqual(expected);
    });
  });
});
