import { updateCommunityDocsWithPathOverride } from "./";
import { logger } from "./loggingUtil";

const updateCommunityDocsByMergeChanges = async () => {
  try {
    const completed = await updateCommunityDocsWithPathOverride();

    logger.info(
      `UpdateCommunityDocs completed: ${JSON.stringify(completed, null, 2)}`
    );
  } catch (error) {
    logger.error(`UpdateCommunityDocs Errored: \n ${JSON.stringify(error)}`);
  }
};
export default updateCommunityDocsByMergeChanges();
