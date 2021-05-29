import { ToastController } from "@ionic/angular";

export class ToastService{
    constructor(public toastController: ToastController) {}

    async presentToast(message:string) {
    

        const toast = await this.toastController.create({
          message: message,
          duration: 2000
        });
        toast.present();
      }
    
} 