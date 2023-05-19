// interface RawGoogleProfile {
//   name: {
//     familyName: string;
//     givenName: string;
//   };
//   emails: {
//     value: string;
//   }[];
//   photos: {
//     value: string;
//   }[];
// }


// async validate(accessToken: string, refreshToken: string, profile: RawGoogleProfile, done: VerifyCallback): Promise<void> {
//   const { name, emails, photos } = profile;

//   const userData = {
//     email: emails[0].value,
//     firstName: name.givenName,
//     lastName: name.familyName,
//     picture: photos[0].value,
//     accessToken,
//     refreshToken,
//   };

//   if (!userData.email.endsWith("@hwdsb.on.ca")) throw new DomainEmailInvalidException();

//   const user = await this.usersService.getOrCreateOne(userData.email, false, {
//     email: userData.email,
//     avatar: userData.picture,
//     name: `${userData.firstName} ${userData.lastName}`,
//   });

//   return done(null, user);
// }
