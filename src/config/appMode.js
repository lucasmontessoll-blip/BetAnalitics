export const APP_MODE={
  PLAYSTORE:true,
  APP_NAME:'BetAnalytics PRO',
  SUPPORT_EMAIL:'betanlyticspro@gmail.com',
  LEGAL:{
    MIN_AGE:18,
    SHOW_RESPONSIBLE_GAMING:true,
    SHOW_NO_BET_HOUSE_WARNING:true
  }
};

export const podeMostrarAfiliados=()=>{
  return APP_MODE.PLAYSTORE===false;
};
