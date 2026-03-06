const String appName = 'Telnor';

///the app version is an tracker used to track app updates.
///This is not a generic app version that shows on the app stores which follows
///the convention of following a sequential update pattern due to the app upgrade.
///
/// The convention for this app version is as follows:
/// x.y.z
/// X: This is the first number in the versioning. It represents the year the update was done. The year count
/// Starts from 2026, and it is incremental from there. So 2026 would be represented as 1, 2027 would be represented as 2 and it increases in that manner.
/// Y: This is the second number of the versioning. It represents the month that update was done.
/// it ranges between 1 to 12 where 1 represents January and 12 represents December.
/// Z: This is referred to as the version number for the app. It indicates how many times an update was done on
/// a given year. it starts at 0 and increments from there. Every year, it resets back to 0.
const String appVersion = '1.3.0';
