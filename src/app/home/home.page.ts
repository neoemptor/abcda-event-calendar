import {Component, ViewChild, OnInit, Inject, LOCALE_ID} from '@angular/core';
import {CalendarComponent} from 'ionic2-calendar';
import {AlertController, ModalController} from '@ionic/angular';
import {formatDate} from '@angular/common';
import {CalModalPage} from '../pages/cal-modal/cal-modal.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(CalendarComponent) myCal: CalendarComponent;
  eventSource = [];
  viewTitle: string;

  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };

  selectedDate: Date;

  constructor(
    private alertCtrl: AlertController,
    @Inject(LOCALE_ID) private locale: string,
    private modalCtrl: ModalController
  ) {
  }

  ngOnInit() {
  }

  next() {
    this.myCal.slideNext();
  }

  back() {
    this.myCal.slidePrev();
  }

  // Selected date reange and hence title changed
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  // Calendar event was clicked
  async onEventSelected(event) {
    // Use Angular date pipe for conversion
    // eslint-disable-next-line prefer-const
    let start = formatDate(event.startTime, 'medium', this.locale);
    // eslint-disable-next-line prefer-const
    let end = formatDate(event.endTime, 'medium', this.locale);

    const alert = await this.alertCtrl.create({
      header: event.title,
      subHeader: event.desc,
      message: 'From: ' + start + '<br><br>To: ' + end,
      buttons: ['OK'],
    });
    alert.present();
  }

  createRandomEvents() {
    const events = [];
    for (let i = 0; i < 50; i += 1) {
      const date = new Date();
      const eventType = Math.floor(Math.random() * 2);
      const startDay = Math.floor(Math.random() * 90) - 45;
      let endDay = Math.floor(Math.random() * 2) + startDay;
      let startTime;
      let endTime;

      if (eventType === 0) {
        startTime = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + startDay
          )
        );

        if (endDay === startDay) {
          endDay += 1;
        }

        endTime = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + endDay
          )
        );
        events.push({
          title: 'All Day - ' + i,
          startTime,
          endTime,
          allDay: true,
        });
      } else {
        const startMinute = Math.floor(Math.random() * 24 * 60);
        const endMinute = Math.floor(Math.random() * 180) + startMinute;
        startTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + startDay,
          0,
          date.getMinutes() + startMinute
        );
        endTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + endDay,
          0,
          date.getMinutes() + endMinute
        );
        events.push({
          title: 'Event - ' + i,
          startTime,
          endTime,
          allDay: false,
        });
      }
    }
    this.eventSource = events;
  }

  removeEvents() {
    this.eventSource = [];
  }

  async openCalModal() {
    const modal = await this.modalCtrl.create({
      component: CalModalPage,
      cssClass: 'cal-modal',
      backdropDismiss: false
    });

    await modal.present();

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.event) {
        const event = result.data.event;
        if (event.allDay) {
          const start = event.startTime;
          event.startTime = new Date(
            Date.UTC(
              start.getUTCFullYear(),
              start.getUTCMonth(),
              start.getUTCDate()
            )
          );
          event.endTime = new Date(
            Date.UTC(
              start.getUTCFullYear(),
              start.getUTCMonth(),
              start.getUTCDate() + 1
            )
          );
        }
        this.eventSource.push(result.data.event);
        this.myCal.loadEvents();
      }
    });
  }
}
