import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShareComponent implements OnInit {
  skipRedirect: boolean;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.skipRedirect = this.route.snapshot.queryParams.skipRedirect == "true";
    if ( this.skipRedirect) {
      return;
    }

    var userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
      window.location.href = "https://play.google.com/store/apps/details?id=com.fortynineblocks.twa";
    } else {
      this.router.navigateByUrl('/');
    }
  }

  ngOnInit(): void {
  }
}
