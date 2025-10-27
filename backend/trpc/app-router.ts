import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { 
  adminAuthProcedure, 
  chiefAdminAuthProcedure,
  generateAccessKeyProcedure,
  validateAccessKeyProcedure,
  listAccessKeysProcedure
} from "./routes/admin/auth/route";
import { 
  listUsersProcedure, 
  getUserProcedure,
  updateUserRoleProcedure, 
  deleteUserProcedure,
  toggleUserStatusProcedure,
  bulkUpdateUsersProcedure
} from "./routes/admin/users/route";
import { 
  sendMessageProcedure as adminSendMessageProcedure, 
  getMessagesProcedure as adminGetMessagesProcedure, 
  deleteMessageProcedure as adminDeleteMessageProcedure 
} from "./routes/admin/messages/route";
import { 
  getContentProcedure, 
  updateImageProcedure, 
  addSermonProcedure, 
  deleteSermonProcedure, 
  addLiveVideoProcedure, 
  deleteLiveVideoProcedure,
  addCourseProcedure,
  updateCourseProcedure,
  deleteCourseProcedure,
  uploadFileProcedure,
  deleteFileProcedure,
  getFilesProcedure,
  getDonationsProcedure,
  getPrayerRequestsProcedure,
  updatePrayerRequestProcedure,
  getVolunteerSignupsProcedure,
  updateVolunteerSignupProcedure,
  getAnalyticsProcedure,
  generateStreamKeyProcedure,
  deleteStreamKeyProcedure,
  toggleStreamKeyProcedure,
  getStreamKeysProcedure,
  updateLiveVideoStatusProcedure,
  listPostsProcedure as adminListPostsProcedure,
  deletePostProcedure as adminDeletePostProcedure,
  flagPostProcedure,
  approvePostProcedure,
  bulkDeletePostsProcedure,
  listTestimoniesProcedure as adminListTestimoniesProcedure,
  approveTestimonyProcedure,
  deleteTestimonyProcedure as adminDeleteTestimonyProcedure
} from "./routes/admin/content/route";
import {
  getNotificationsProcedure,
  sendNotificationProcedure,
  updateNotificationProcedure,
  deleteNotificationProcedure
} from "./routes/admin/notifications/route";
import {
  listGroupsProcedure,
  getGroupProcedure,
  createGroupProcedure,
  joinGroupProcedure,
  leaveGroupProcedure,
  updateGroupProcedure,
  deleteGroupProcedure
} from "./routes/community/groups/route";
import {
  listPostsProcedure,
  getPostProcedure,
  createPostProcedure,
  updatePostProcedure,
  deletePostProcedure,
  likePostProcedure,
  addCommentProcedure,
  deleteCommentProcedure,
  getFlaggedPostsProcedure,
  reviewFlaggedPostProcedure
} from "./routes/community/posts/route";
import {
  getConversationsProcedure,
  getConversationProcedure,
  getMessagesProcedure,
  sendMessageProcedure,
  markAsReadProcedure,
  deleteMessageProcedure,
  getAllMessagesProcedure,
  adminDeleteMessageProcedure as communityAdminDeleteMessageProcedure,
  getAllConversationsProcedure
} from "./routes/community/messages/route";
import {
  listTestimoniesProcedure as listTestimoniesCommProcedure,
  getTestimonyProcedure,
  createTestimonyProcedure,
  likeTestimonyProcedure,
  addTestimonyCommentProcedure,
  deleteTestimonyProcedure as deleteTestimonyCommProcedure,
  approveTestimonyProcedure as approveTestimonyCommProcedure
} from "./routes/community/testimonies/route";
import {
  getUserProfileProcedure,
  updateProfileProcedure,
  followUserProcedure,
  unfollowUserProcedure,
  searchUsersProcedure,
  isMasterAdminProcedure
} from "./routes/community/users/route";
import {
  listEventsProcedure,
  getEventProcedure,
  createEventProcedure,
  updateEventProcedure,
  deleteEventProcedure,
  uploadEventImageProcedure
} from "./routes/admin/events/route";
import {
  listMusicProcedure,
  getMusicProcedure,
  createMusicProcedure,
  updateMusicProcedure,
  deleteMusicProcedure
} from "./routes/admin/music/route";
import {
  listProductsProcedure,
  getProductProcedure,
  createProductProcedure,
  updateProductProcedure,
  deleteProductProcedure,
  listOrdersProcedure,
  getOrderProcedure,
  updateOrderStatusProcedure,
  createOrderProcedure,
  getStoreStatsProcedure
} from "./routes/admin/store/route";
import {
  createDonationProcedure,
  listDonationsProcedure,
  getDonationStatsProcedure
} from "./routes/donations/route";
import {
  listAssignmentsProcedure,
  createAssignmentProcedure,
  updateAssignmentStatusProcedure,
  deleteAssignmentProcedure,
  getAssignmentStatsProcedure
} from "./routes/discipleship/route";
import {
  startCallProcedure,
  endCallProcedure,
  updateCallStatusProcedure,
  saveRecordingProcedure,
  transcribeRecordingProcedure,
  getCallHistoryProcedure,
  getCallProcedure,
  getRecordingsProcedure,
  saveCallNotesProcedure,
  getAllCallsProcedure,
  deleteCallRecordingProcedure
} from "./routes/calls/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  donations: createTRPCRouter({
    create: createDonationProcedure,
    list: listDonationsProcedure,
    stats: getDonationStatsProcedure,
  }),
  discipleship: createTRPCRouter({
    list: listAssignmentsProcedure,
    create: createAssignmentProcedure,
    updateStatus: updateAssignmentStatusProcedure,
    delete: deleteAssignmentProcedure,
    stats: getAssignmentStatsProcedure,
  }),
  admin: createTRPCRouter({
    auth: adminAuthProcedure,
    chiefAuth: chiefAdminAuthProcedure,
    generateAccessKey: generateAccessKeyProcedure,
    validateAccessKey: validateAccessKeyProcedure,
    listAccessKeys: listAccessKeysProcedure,
    users: createTRPCRouter({
      list: listUsersProcedure,
      get: getUserProcedure,
      updateRole: updateUserRoleProcedure,
      delete: deleteUserProcedure,
      toggleStatus: toggleUserStatusProcedure,
      bulkUpdate: bulkUpdateUsersProcedure,
    }),
    messages: createTRPCRouter({
      send: adminSendMessageProcedure,
      getAll: adminGetMessagesProcedure,
      delete: adminDeleteMessageProcedure,
    }),
    content: createTRPCRouter({
      get: getContentProcedure,
      updateImage: updateImageProcedure,
      addSermon: addSermonProcedure,
      deleteSermon: deleteSermonProcedure,
      addLiveVideo: addLiveVideoProcedure,
      deleteLiveVideo: deleteLiveVideoProcedure,
      addCourse: addCourseProcedure,
      updateCourse: updateCourseProcedure,
      deleteCourse: deleteCourseProcedure,
      uploadFile: uploadFileProcedure,
      deleteFile: deleteFileProcedure,
      getFiles: getFilesProcedure,
      getDonations: getDonationsProcedure,
      getPrayerRequests: getPrayerRequestsProcedure,
      updatePrayerRequest: updatePrayerRequestProcedure,
      getVolunteerSignups: getVolunteerSignupsProcedure,
      updateVolunteerSignup: updateVolunteerSignupProcedure,
      getAnalytics: getAnalyticsProcedure,
      listPosts: adminListPostsProcedure,
      deletePost: adminDeletePostProcedure,
      flagPost: flagPostProcedure,
      approvePost: approvePostProcedure,
      bulkDeletePosts: bulkDeletePostsProcedure,
      listTestimonies: adminListTestimoniesProcedure,
      approveTestimony: approveTestimonyProcedure,
      deleteTestimony: adminDeleteTestimonyProcedure,
      generateStreamKey: generateStreamKeyProcedure,
      deleteStreamKey: deleteStreamKeyProcedure,
      toggleStreamKey: toggleStreamKeyProcedure,
      getStreamKeys: getStreamKeysProcedure,
      updateLiveVideoStatus: updateLiveVideoStatusProcedure,
    }),
    notifications: createTRPCRouter({
      getAll: getNotificationsProcedure,
      send: sendNotificationProcedure,
      update: updateNotificationProcedure,
      delete: deleteNotificationProcedure,
    }),
    events: createTRPCRouter({
      list: listEventsProcedure,
      get: getEventProcedure,
      create: createEventProcedure,
      update: updateEventProcedure,
      delete: deleteEventProcedure,
      uploadImage: uploadEventImageProcedure,
    }),
    music: createTRPCRouter({
      list: listMusicProcedure,
      get: getMusicProcedure,
      create: createMusicProcedure,
      update: updateMusicProcedure,
      delete: deleteMusicProcedure,
    }),
    store: createTRPCRouter({
      products: createTRPCRouter({
        list: listProductsProcedure,
        get: getProductProcedure,
        create: createProductProcedure,
        update: updateProductProcedure,
        delete: deleteProductProcedure,
      }),
      orders: createTRPCRouter({
        list: listOrdersProcedure,
        get: getOrderProcedure,
        updateStatus: updateOrderStatusProcedure,
        create: createOrderProcedure,
      }),
      stats: getStoreStatsProcedure,
    }),
  }),
  community: createTRPCRouter({
    groups: createTRPCRouter({
      list: listGroupsProcedure,
      get: getGroupProcedure,
      create: createGroupProcedure,
      join: joinGroupProcedure,
      leave: leaveGroupProcedure,
      update: updateGroupProcedure,
      delete: deleteGroupProcedure,
    }),
    posts: createTRPCRouter({
      list: listPostsProcedure,
      get: getPostProcedure,
      create: createPostProcedure,
      update: updatePostProcedure,
      delete: deletePostProcedure,
      like: likePostProcedure,
      addComment: addCommentProcedure,
      deleteComment: deleteCommentProcedure,
      flagged: getFlaggedPostsProcedure,
      reviewFlagged: reviewFlaggedPostProcedure,
    }),
    messages: createTRPCRouter({
      conversations: getConversationsProcedure,
      conversation: getConversationProcedure,
      list: getMessagesProcedure,
      send: sendMessageProcedure,
      markAsRead: markAsReadProcedure,
      delete: deleteMessageProcedure,
      getAll: getAllMessagesProcedure,
      adminDelete: communityAdminDeleteMessageProcedure,
      getAllConversations: getAllConversationsProcedure,
    }),
    testimonies: createTRPCRouter({
      list: listTestimoniesCommProcedure,
      get: getTestimonyProcedure,
      create: createTestimonyProcedure,
      like: likeTestimonyProcedure,
      addComment: addTestimonyCommentProcedure,
      delete: deleteTestimonyCommProcedure,
      approve: approveTestimonyCommProcedure,
    }),
    users: createTRPCRouter({
      profile: getUserProfileProcedure,
      updateProfile: updateProfileProcedure,
      follow: followUserProcedure,
      unfollow: unfollowUserProcedure,
      search: searchUsersProcedure,
      isMasterAdmin: isMasterAdminProcedure,
    }),
  }),
  calls: createTRPCRouter({
    start: startCallProcedure,
    end: endCallProcedure,
    updateStatus: updateCallStatusProcedure,
    saveRecording: saveRecordingProcedure,
    transcribe: transcribeRecordingProcedure,
    history: getCallHistoryProcedure,
    get: getCallProcedure,
    recordings: getRecordingsProcedure,
    saveNotes: saveCallNotesProcedure,
    getAll: getAllCallsProcedure,
    deleteRecording: deleteCallRecordingProcedure,
  }),
});

export type AppRouter = typeof appRouter;