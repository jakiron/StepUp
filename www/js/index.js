var stepup = {
    watchId:null,
    initialize:function(){
        this.bindEvents();
    },
    bindEvents:function(){
        $(document).on('deviceready', this.onDeviceReady);
    },
    onDeviceReady:function(){
        $(document).on('backbutton',stepup.exitApp);
        $('#accelswitch').on('change',function(){
            var $this=$(this),sv=$this.find(':selected').val();
            if(Number(sv)){$("#vector").html('<li>Started</li>');stepup.startWatch()}
            else{$("#vector").append('<li>Stopped</li>');stepup.stopWatch()}
        });
    },
    exitApp:function(){
        navigator.app.exitApp();
    },
    notify:function(type,message,cb){
        switch(type){
            case 'alert':
                navigator.notification.alert(message,cb,'StepUp','Dismiss');
                break;
            case 'confirm':
                navigator.notification.confirm(message,cb,'StepUp');
                break;
            case 'vibrate':
            default:
                navigator.notification.vibrate(200);
        }
    },
    startWatch:function(){
            var op={frequency:1000};window.localStorage.setItem('accelvector',JSON.stringify([]));
            stepup.watchId = navigator.accelerometer.watchAcceleration(onS,onE,op);
            function onS(acceleration){
                var x=acceleration.x,y=acceleration.y,z=acceleration.z,v=0;v=Math.sqrt(x*x+y*y+z*z);
                var accelvector=JSON.parse(window.localStorage.getItem('accelvector'));accelvector.push(v);
                window.localStorage.setItem('accelvector',JSON.stringify(accelvector));
            }
            function onE(){
                stepup.notify('alert','Error reading accelerometer',null);
            }
    },
    stopWatch:function(){
        if(stepup.watchId){
            navigator.accelerometer.clearWatch(stepup.watchId);    
        }
        stepup.stepCount();
    },
    ema:function(){
        var accelvector = JSON.parse(window.localStorage.getItem('accelvector')),alpha=0.6,s=accelvector[0];
        for(var i=1;i<accelvector.length;++i){
            s=(1-alpha)*s+alpha*accelvector[i];
            $("#ema").append('<li>'+s+'</li>');
        }
        window.localStorage.setItem('accelema',s);
    },
    stepCount:function(){
        stepup.ema();
        var accelvector=JSON.parse(window.localStorage.getItem('accelvector')),accelema=Number(window.localStorage.getItem('accelema')),stepcount=0;
        for(var i=1;i<accelvector.length;++i){
            var accelvn=accelvector[i],accelvp=accelvector[i-1];$("#vector").append('<li>'+accelvn+','+Math.abs(accelvn-accelvp)+','+accelvp+'</li>');
            if(accelema>(accelvn<accelvp?accelvn:accelvp) && accelema<(accelvn>accelvp?accelvn:accelvp)){
                    ++stepcount;
            }
        }
        $("#vector").append('<li>'+stepcount+' steps!</li>');
    }
};