export default class Customer {
    constructor(id, accRole, accStatus, createdAt, displayName, email, imgType, isVerified, profileUpdatedAt, signedInAt, userPhoto) {
        this.id = id;
        this.accRole = accRole;
        this.accStatus = accStatus;
        this.createdAt = createdAt;
        this.displayName = displayName;
        this.email = email;
        this.imgType = imgType;
        this.isVerified = isVerified;
        this.profileUpdatedAt = profileUpdatedAt;
        this.signedInAt = signedInAt;
        this.userPhoto = userPhoto;
    }
}