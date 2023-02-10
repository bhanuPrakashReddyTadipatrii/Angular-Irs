import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ucp-cards-view-page',
  templateUrl: './cards-view-page.component.html',
  styleUrls: ['./cards-view-page.component.scss']
})
export class CardsViewPageComponent implements OnInit {

  public cardsViewData: any = [
    {
      incident_name: 'Fire Accident',
      posted_on: '01/01/2000',
      authority: 'mla',
      status: 'In Progress',
      incident_img: '',
      no_of_raises: '25k',
      url: 'https://mail.google.com/mail/u/0/#inbox',
      incident_desc:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis et iste quos tenetur obcaecati earum nostrum quibusdam quidem error nesciunt! Deserunt ab quis ratione eum ea molestiae ad veritatis voluptas.',
      comments: [{
        comment_desc: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      }]
    },
    {
      incident_name: 'Fire Accident',
      posted_on: '01/01/2000',
      authority: 'mla',
      status: 'In Progress',
      incident_img: '',
      no_of_raises: '25k',
      url: 'https://echarts.apache.org/examples/en/index.html#chart-type-line',
      incident_desc:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis et iste quos tenetur obcaecati earum nostrum quibusdam quidem error nesciunt! Deserunt ab quis ratione eum ea molestiae ad veritatis voluptas.',
      comments: [{
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      }]
    },
    {
      incident_name: 'Fire Accident',
      posted_on: '01/01/2000',
      authority: 'mla',
      status: 'In Progress',
      incident_img: '',
      url: 'https://echarts.apache.org/examples/en/index.html#chart-type-line',
      no_of_raises: '25k',
      incident_desc:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis et iste quos tenetur obcaecati earum nostrum quibusdam quidem error nesciunt! Deserunt ab quis ratione eum ea molestiae ad veritatis voluptas.',
      comments: [{
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      }]
    },
    {
      incident_name: 'Fire Accident',
      posted_on: '01/01/2000',
      authority: 'mla',
      status: 'In Progress',
      incident_img: '',
      no_of_raises: '25k',
      incident_desc:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis et iste quos tenetur obcaecati earum nostrum quibusdam quidem error nesciunt! Deserunt ab quis ratione eum ea molestiae ad veritatis voluptas.',
      comments: [{
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      }]
    },
    {
      incident_name: 'Fire Accident',
      posted_on: '01/01/2000',
      authority: 'mla',
      status: 'In Progress',
      incident_img: '',
      no_of_raises: '25k',
      incident_desc:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis et iste quos tenetur obcaecati earum nostrum quibusdam quidem error nesciunt! Deserunt ab quis ratione eum ea molestiae ad veritatis voluptas.',
      comments: [{
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      },
      {
        comment_desc: 'gdetydweyd',
        name: 'Sabari',
        phone_no: '9876543210',
        commented_date: '10/01/2000'
      }]
    }
  ];

  public popupContent: any = {};

  public commentText: any = '';

  constructor() { }

  ngOnInit(): void {
  }

  openCommentsPopup(data, key) {
    try {
      if (key === 'comments') {
        document.getElementById('openCommentsModal').click();
      }
      this.popupContent = data;
    } catch (error) {
      console.error(error);
    }
  }

  addComment() {
    try {
      if (!this.commentText) {
        return;
      } else {
        console.log(this.commentText);
        document.getElementById('openCommentsModal').click();
      }
    } catch (error) {
      console.error(error);
    }
  }

  copyInputMessage(val) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

}
