'use strict';

angular.module('mycontractApp')
    .controller('ContractStatsController', function ($scope, $state, Contract) {
        $scope.sumByMonthResults = [];

        $scope.sumByMonth = function() {
            Contract.sumbymonth({},function(result) {
                $scope.sumByMonthResults.push(result.January);
                $scope.sumByMonthResults.push(result.February);
                $scope.sumByMonthResults.push(result.March);
                $scope.sumByMonthResults.push(result.April);
                $scope.sumByMonthResults.push(result.May);
                $scope.sumByMonthResults.push(result.June);
                $scope.sumByMonthResults.push(result.July);
                $scope.sumByMonthResults.push(result.August);
                $scope.sumByMonthResults.push(result.September);
                $scope.sumByMonthResults.push(result.October);
                $scope.sumByMonthResults.push(result.November);
                $scope.sumByMonthResults.push(result.December);

                var ctx = $("#myBarChart");
                var data = {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    datasets: [
                        {
                            label: "Contract amount by month",
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderWidth: 1,
                            data: $scope.sumByMonthResults
                        }
                    ]
                };
                $scope.myBarChart = new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: {
                        scales: {
                            xAxes: [{
                                stacked: true
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        }
                    }
                });
            });
        };

        $scope.sumByMonth();



        $scope.refresh = function () {
            $scope.sumByMonth();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.sumByMonthResults = {}
        };
    });
