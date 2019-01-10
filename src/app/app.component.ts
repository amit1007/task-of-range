import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    public start: string;
    public range: string;

    public constructor() {
        this.start = "pashan";
        this.range = "300";
    }

    public ngOnInit() { }

}