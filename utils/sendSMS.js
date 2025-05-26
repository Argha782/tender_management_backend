// import API from "../../frontend/src/services/api";

// const sendSMS = async (phone, message) => {
//   const FAST2SMS_API = process.env.FAST2SMS_API; // Store your Fast2SMS key
//   await API.post(
//     "https://www.fast2sms.com/dev/bulkV2",
//     {
//       route: "v3",
//       sender_id: "TXTIND",
//       message,
//       language: "english",
//       flash: 0,
//       numbers: phone,
//     },
//     {
//       headers: {
//         authorization: FAST2SMS_API,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// export default sendSMS;
