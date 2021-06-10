import {AnimationController, Animation, createAnimation} from '@ionic/angular';

export const enterAnimation = (baseEl: HTMLElement, opts?:any):Animation =>{

    const DURATION = 400;
    const animationCtrl = new AnimationController();
    if(opts.direction == 'forward'){
        return animationCtrl.create()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing("ease-in")
        .fromTo('opacity',0, 1);
    }else{
        const rootAnimation = animationCtrl.create()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing("ease-in")
        .fromTo('opacity',0, 1);

        const leavingAnimation = animationCtrl.create()
        .addElement(opts.leavingEl)
        .duration(DURATION)
        .easing("ease-out")
        .fromTo('opacity',1,0);

        return animationCtrl.create().addAnimation([rootAnimation,leavingAnimation]);
    }

}

export function pageTransition(_: HTMLElement, opts?: any) {
    const DURATION = 300;
  
    // root animation with common setup for the whole transition
    const rootTransition = createAnimation()
      .duration(opts.duration || DURATION)
      .easing('cubic-bezier(0.3,0,0.66,1)');
  
    // ensure that the entering page is visible from the start of the transition
    const enteringPage = createAnimation()
      .addElement(opts.enteringEl)
      .beforeRemoveClass('ion-page-invisible');
  
    // create animation for the leaving page
    const leavingPage = createAnimation().addElement(
      opts.leavingEl
    );
  
    // actual customized animation
    if (opts.direction === 'forward') {
      enteringPage.fromTo('transform', 'translateX(100%)', 'translateX(0)');
      leavingPage.fromTo('opacity', '1', '0.25');
    } else {
      leavingPage.fromTo('transform', 'translateX(0)', 'translateX(100%)');
      enteringPage.fromTo('opacity', '0.25', '1');
    }
  
    // include animations for both pages into the root animation
    rootTransition.addAnimation(enteringPage);
    rootTransition.addAnimation(leavingPage);
    return rootTransition;
  }