/* eslint-disable no-undef */
/**
 * Lista cotejo activity (Export)
 *
 * Released under Attribution-ShareAlike 4.0 International License.
 * Author: Manuel Narváez Martínez y Javier Cayetano Rodríguez
 * Ana María Zamora Moreno
 * License: http://creativecommons.org/licenses/by-sa/4.0/
 *
 */
var $eXeListaCotejo = {
    idevicePath: '',
    options: [],
    isInExe: false,
    data: null,
    init: function () {
        this.isInExe = eXe.app.isInExe(); //eXe 3.0
        this.idevicePath = this.isInExe
            ? eXe.app.getIdeviceInstalledExportPath('checklist')
            : $('.idevice_node.checklist').eq(0).attr('data-idevice-path');

        this.activities = $('.listacotejo-IDevice');

        if (this.activities.length == 0) {
            $('.ctj-IDevice').hide();
            return;
        }

        if (
            !$exeDevices.iDevice.gamification.helpers.supportedBrowser(
                'Checklist',
            )
        )
            return;

        if ($('#exe-submitButton').length > 0) {
            this.activities.hide();
            if (typeof _ != 'undefined')
                this.activities.before('<p>' + _('Checklist') + '</p>');
            return;
        }

        this.enable();
    },

    enable: function () {
        $eXeListaCotejo.loadGame();
    },

    loadGame: function () {
        $eXeListaCotejo.options = [];

        $eXeListaCotejo.activities.each(function (i) {
            const dl = $('.listacotejo-DataGame', this);

            let img = $('.listacotejo-LinkCommunity', this);
            if (img.length == 1) {
                img = img.attr('src') || '';
            } else {
                img = '';
            }

            let img1 = $('.listacotejo-LinkLogo', this);
            if (img1.length == 1) {
                img1 = img1.attr('src') || '';
            } else {
                img1 = '';
            }

            let img2 = $('.listacotejo-LinkDecorative', this);
            if (img2.length == 1) {
                img2 = img2.attr('src') || '';
            } else {
                img2 = '';
            }

            const mOption = $eXeListaCotejo.loadDataGame(dl, img, img1, img2);
            $eXeListaCotejo.options.push(mOption);

            const ctj = $eXeListaCotejo.createInterfaceListaCotejo(i);
            dl.before(ctj).remove();

            $eXeListaCotejo.addEvents(i);

            $('#ctjMainContainer-' + i).show();
        });
        $exeDevices.iDevice.gamification.math.updateLatex(
            '.listacotejo-IDevice',
        );
    },

    loadDataGame: function (data, imglink, imglink1, imglink2) {
        let json = data.text();
        json = $exeDevices.iDevice.gamification.helpers.decrypt(json);

        const mOptions =
            $exeDevices.iDevice.gamification.helpers.isJsonString(json);

        mOptions.urlCommunity = imglink;
        mOptions.urlLogo = imglink1;
        mOptions.urlDecorative = imglink2;
        mOptions.id = typeof mOptions.id == 'undefined' ? false : mOptions.id;
        mOptions.useScore =
            typeof mOptions.useScore == 'undefined' ? false : mOptions.useScore;
        mOptions.save = true;
        mOptions.showCounter = true;
        mOptions.points = 0;
        mOptions.totalPoints = 0;

        for (let i = 0; i < mOptions.levels.length; i++) {
            mOptions.levels[i].points =
                typeof mOptions.levels[i].points == 'undefined'
                    ? ''
                    : mOptions.levels[i].points;
            const parsedPoints = parseInt(mOptions.levels[i].points);
            if (!isNaN(parsedPoints)) {
                mOptions.totalPoints += parsedPoints;
            }
        }
        return mOptions;
    },

    saveCotejo: function (instance) {
        const mOptions = $eXeListaCotejo.options[instance];

        if (mOptions.id && mOptions.saveData && mOptions.save) {
            const name = $('#ctjUserName-' + instance).val() || '',
                date = $('#ctjUserDate-' + instance).val() || '';
            let data = {
                name: name,
                date: date,
                items: [],
            };
            let arr = [];
            $('#ctjItems-' + instance)
                .find('.CTJP-Item').each(function () {
                    let obj = {};
                    const $checkbox = $(this).find("input[type='checkbox']"),
                        $inputText = $(this).find("input[type='text']"),
                        $select = $(this).find('select');

                    if ($checkbox.length > 0 && $inputText.length > 0) {
                        obj.type = 1;
                        obj.state = $checkbox.is(':checked') ? 1 : 0;
                        obj.text = $inputText.val();
                    } else if ($checkbox.length > 0) {
                        obj.type = 0;
                        obj.state = $checkbox.is(':checked') ? 1 : 0;
                        obj.text = '';
                    } else if ($select.length > 0) {
                        obj.type = 2;
                        obj.state = $select.val();
                        obj.text = $select.find('option:selected').text();
                    } else {
                        obj.type = 3;
                        obj.state = false;
                        obj.text = '';
                    }
                    arr.push(obj);
                });

            data.items = arr;
            data = JSON.stringify(data);
            localStorage.setItem('dataCotejo-' + mOptions.id, data);
        }
    },
    updateItems: function (id, instance) {
        const data = $eXeListaCotejo.getDataStorage(id);

        if (!data) return;

        let arr = data.items || [];
        $('#ctjUserName-' + instance).val(data.name || '');
        $('#ctjUserDate-' + instance).val(data.date || '');
        $('#ctjItems-' + instance)
            .find('.CTJP-Item')
            .each(function (index) {
                const obj = arr[index];
                if (!obj) return;
                const $checkbox = $(this).find("input[type='checkbox']"),
                    $inputText = $(this).find("input[type='text']"),
                    $select = $(this).find('select');
                switch (obj.type) {
                    case 0:
                        if ($checkbox.length > 0) {
                            $checkbox.prop('checked', obj.state === 1);
                        }
                        break;
                    case 1:
                        if ($checkbox.length > 0) {
                            $checkbox.prop('checked', obj.state === 1);
                        }
                        if ($inputText.length > 0) {
                            $inputText.val(obj.text);
                        }
                        break;
                    case 2:
                        if ($select.length > 0) {
                            $select.val(obj.state);
                        }
                        break;
                    case 3:
                        break;
                }
            });
    },

    getDataStorage: function (id) {
        return $exeDevices.iDevice.gamification.helpers.isJsonString(
            localStorage.getItem('dataCotejo-' + id),
        );
    },

    createInterfaceListaCotejo: function (instance) {
        const mOptions = $eXeListaCotejo.options[instance],
            urll =
                mOptions.urlLogo ||
                `${$eXeListaCotejo.idevicePath}cotejologo.png`,
            urlc =
                mOptions.urlCommunity ||
                `${$eXeListaCotejo.idevicePath}cotejologocomunidad.png`,
            urld =
                mOptions.urlDecorative ||
                `${$eXeListaCotejo.idevicePath}cotejoicon.png`,
            isMobile =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent,
                ),
            dl = mOptions.hasLogo ? 'block' : 'none',
            dc = mOptions.hasCommunity ? 'block' : 'none',
            dd = mOptions.hasDecorative && !isMobile ? 'block' : 'none',
            footer = mOptions.footer || '',
            df = footer ? 'block' : 'none',
            ud = mOptions.userData ? 'flex' : 'none',
            us = mOptions.userScore ? 'block' : 'none',
            html = `
            <div class="CTJP-MainContainer"  id="ctjMainContainer-${instance}">
                <div class="CTJP-GameContainer" id="ctjGameContainer-${instance}">
                    <div id="ctjList-${instance}" class="CTJP-List">
                        <div class="CTJP-Header">
                            <div class="CTJP-Images" style="background-image:url(${urlc}); display:${dc};"></div>
                            <div class="CTJP-Images" style="background-image:url(${urll}); display:${dl};"></div>
                        </div>
                        <div id="ctjTitle-${instance}" class="CTJP-Title">${mOptions.title}</div>
                        <div id="ctjSubTitle-${instance}" class="CTJP-SubTitle">${mOptions.subtitle}</div>
                        <div id="ctjUserData-${instance}" class="CTJP-UserData" style="display:${ud};">
                            <div id="ctjUserNameDiv-${instance}" class="CTJP-UserName">
                                <label for="ctjUserName-${instance}">${mOptions.msgs.msgName}: </label><input type="text" id="ctjUserName-${instance}">
                            </div>
                            <div id="ctjUserDateDiv-${instance}" class="CTJP-UserDate">
                                <label for="ctjUserDate-${instance}">${mOptions.msgs.msgDate}: </label><input type="text" id="ctjUserDate-${instance}">
                            </div>
                        </div>
                        <hr class="CTJP-Line"/>
                        <div class="CTJP-Counters">
                            <div id="ctjCounter-${instance}">${mOptions.msgs.msgComplit}</div>
                            <div id="ctjScore-${instance}" style="display:${us}">${mOptions.msgs.msgScore}</div>
                        </div>
                        <div class="CTJP-Data">
                            <div id="ctjItems-${instance}" class="CTJP-Items">${$eXeListaCotejo.createItems(instance)}</div>
                            <div class="CTJP-ImgDecorative" style="background-image:url(${urld}); display:${dd};"></div>
                        </div>
                        <div class="CTJP-Footer" style="display:${df}">${footer}</div>
                    </div>
                    <div class="CTJP-Capture">
                        <button type="button" id="ctjReboot-${instance}" class="btn btn-primary btn-sm" aria-label="${mOptions.msgs.msgReboot}">${mOptions.msgs.msgReboot}</button>
                        <button type="button" id="ctjCapture-${instance}" class="btn btn-primary btn-sm" aria-label="${mOptions.msgs.msgSave}">${mOptions.msgs.msgSave}</button>
                    </div>
                </div>
            </div>`;
        return html;
    },

    addEvents: function (instance) {
        const mOptions = $eXeListaCotejo.options[instance];

        $('#ctjCapture-' + instance).on('click', function (e) {
            e.preventDefault();
            $eXeListaCotejo.saveReport(instance);
        });

        $('#ctjItems-' + instance)
            .find('.CTJP-Item')
            .on(
                'input',
                "input[type='checkbox'], input[type='text']",
                function () {
                    $eXeListaCotejo.saveCotejo(instance);
                    $eXeListaCotejo.counter(instance);
                },
            );

        $('#ctjItems-' + instance)
            .find('.CTJP-Item')
            .on('change', 'select', function () {
                $eXeListaCotejo.saveCotejo(instance);
                $eXeListaCotejo.counter(instance);
            });

        $('#ctjUserName-' + instance).on('change', function () {
            $eXeListaCotejo.saveCotejo(instance);
        });

        $('#ctjUserDate-' + instance).on('change', function () {
            $eXeListaCotejo.saveCotejo(instance);
        });

        mOptions.save = false;

        if (mOptions.saveData && mOptions.id) {
            $eXeListaCotejo.updateItems(mOptions.id, instance);
            mOptions.save = true;
        }

        $eXeListaCotejo.counter(instance);

        $exeDevices.iDevice.gamification.math.updateLatex(
            '#ctjGameContainer-' + instance,
        );

        $('#ctjReboot-' + instance).on('click', function (e) {
            e.preventDefault();
            if (confirm(mOptions.msgs.msgDelete)) {
                localStorage.removeItem('dataCotejo-' + mOptions.id);
                mOptions.points = 0;
                mOptions.totalPoints = 0;
                $('#ctjUserName-' + instance).val('');
                $('#ctjUserDate-' + instance).val('');
                $('#ctjItems-' + instance).empty();
                $('#ctjItems-' + instance).append(
                    $eXeListaCotejo.createItems(instance),
                );
                $eXeListaCotejo.counter(instance);
            }
        });
    },

    counter: function (instance) {
        const mOptions = $eXeListaCotejo.options[instance];
        let completados = 0,
            en_proceso = 0,
            total_items = 0,
            points = 0;

        $('#ctjItems-' + instance).find('.CTJP-Item').each(function (i) {
            if ($(this).find('input[type="checkbox"], select').length > 0) {
                total_items++;
            }
            if ($(this).find('input[type="checkbox"]:checked').length > 0) {
                completados++;
                points += $eXeListaCotejo.convertToNumber(
                    mOptions.levels[i].points,
                );
            }
            if ($(this).find('select option[value="1"]:selected').length > 0) {
                completados++;
                points += $eXeListaCotejo.convertToNumber(
                    mOptions.levels[i].points,
                );
            }
            if ($(this).find('select option[value="2"]:selected').length > 0) {
                en_proceso++;
                points +=
                    $eXeListaCotejo.convertToNumber(mOptions.levels[i].points) /
                    2;
            }
        });

        mOptions.points = points;

        $('#ctjCounter-' + instance).hide();
        if (mOptions.showCounter) {
            let ct =
                mOptions.msgs.msgComplit +
                ': ' +
                completados +
                '/' +
                total_items +
                '. ';
            if (en_proceso > 0) {
                ct +=
                    mOptions.msgs.msgInProgress +
                    ': ' +
                    en_proceso +
                    '/' +
                    total_items +
                    '.';
            }
            if (completados == 0 && en_proceso == 0) {
                ct = mOptions.msgs.msgtaskNumber + ': ' + total_items;
            }
            $('#ctjCounter-' + instance).text(ct);
            $('#ctjCounter-' + instance).show();
        }

        $('#ctjScore-' + instance).hide();

        if (mOptions.useScore && mOptions.totalPoints > 0) {
            const ctj =
                mOptions.msgs.msgScore +
                ': ' +
                mOptions.points +
                '/' +
                mOptions.totalPoints +
                '.';
            $('#ctjScore-' + instance).text(ctj);
            $('#ctjScore-' + instance).show();
        }
    },

    convertToNumber: function (str) {
        let num = parseInt(str);
        return isNaN(num) ? 0 : num;
    },

    saveReport: function (instance) {
        const mOptions = $eXeListaCotejo.options[instance],
            divElement = document.getElementById('ctjList-' + instance);

        if (!divElement) {
            console.error(
                'No se encontró el elemento con el ID proporcionado.',
            );
            return;
        }

        const opacity = $('#ctjList-' + instance)
            .find('mjx-assistive-mml')
            .eq(0)
            .css('opacity'),
            mmls = $('#ctjList-' + instance).find('mjx-assistive-mml');

        mmls.each(function () {
            $(this).css('opacity', '0.0');
        });

        html2canvas(divElement)
            .then(function (canvas) {
                const imageData = canvas.toDataURL('image/png'),
                    link = document.createElement('a');
                link.href = imageData;
                link.download = mOptions.msgs.msgList + '.png';
                link.click();
            })
            .catch(function (error) {
                mmls.each(function () {
                    $(this).css('opacity', opacity);
                });
                console.error('Error al generar la captura: ', error);
            });
        mmls.each(function () {
            $(this).css('opacity', opacity);
        });
    },

    createItems: function (instance) {
        const mOptions = $eXeListaCotejo.options[instance];
        let html = '';
        for (let level of mOptions.levels) {
            const marginLeft = 1.5 * parseInt(level.nivel) + 0.5,
                msgp =
                    level.points.trim() == '1'
                        ? mOptions.msgs.msgPoint
                        : mOptions.msgs.msgPoints,
                msg = '(' + level.points + ' ' + msgp + ')',
                points =
                    mOptions.useScore && level.points.trim().length > 0
                        ? msg
                        : '';
            if (level.type === '0') {
                html += `<div class="CTJP-Item"><input type="checkbox" style="margin-left: ${marginLeft}em" /><span style="">${level.item}</span></span><span class= "CTJP-Points">${points}</span></div>`;
            } else if (level.type === '1') {
                html += `<div class="CTJP-Item"><input type="checkbox" style="margin-left: ${marginLeft}em" /><span>${level.item}</span></span><span class= "CTJP-Points">${points}</span><input type="text" /></div>`;
            } else if (level.type === '2') {
                html += `<div class="CTJP-Item"><select  style="margin-left: ${marginLeft}em"  class="CTJ-Select"><option value="0" selected></option><option value="1">${mOptions.msgs.msgDone}</option><option value="2">${mOptions.msgs.msgInProgress}</option><option value="3">${mOptions.msgs.msgUnrealized}</option></select><span>${level.item}</span></span><span class= "CTJP-Points">${points}</span></div>`;
            } else if (level.type === '3') {
                html += `<div class="CTJP-Item"><span style="display:inlin-block;margin-left: ${marginLeft}em">${level.item}</span><span class= "CTJP-Points">${points}</span></div>`;
            }
        }
        return html;
    },
};
$(function () {
    $eXeListaCotejo.init();
});
