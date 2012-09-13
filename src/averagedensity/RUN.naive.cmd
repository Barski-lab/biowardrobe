@echo off
@rem del *.log
@rem del *.csv

"debug/averagedensity.exe" -in="Naive-H2AZ-208-5.bam" -out="Naive-H2AZ-208-5.csv" -log="Naive-H2AZ-208-5.log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -batch="batch.naive" -avd_window=2000 -avd_smooth=50 -plot_ext="svg" -gnuplot="cmd /C \"C:\Program Files (x86)\gnuplot\bin\gnuplot.exe\""
"debug/averagedensity.exe" -in="Naive-H3K4me1-Duplicate-319-4.bam" -out="Naive-H3K4me1-Duplicate-319-4.csv" -log="Naive-H3K4me1-Duplicate-319-4.log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -batch="batch.naive" -avd_window=2000 -avd_smooth=50 -plot_ext="svg" -gnuplot="cmd /C \"C:\Program Files (x86)\gnuplot\bin\gnuplot.exe\""
"debug/averagedensity.exe" -in="Naive-H3K4me3-Duplicate-236-8.bam" -out="Naive-H3K4me3-Duplicate-236-8.csv" -log="Naive-H3K4me3-Duplicate-236-8.log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -batch="batch.naive" -avd_window=2000 -avd_smooth=50 -plot_ext="svg" -gnuplot="cmd /C \"C:\Program Files (x86)\gnuplot\bin\gnuplot.exe\""
@rem "debug/averagedensity.exe" -in=".bam" -out=".txt" -log=".log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -avd_window=2000 -batch="batch.naive"

@rem CM-H2AZ-208-6.bam
@rem CM-H3K4me1-Duplicate-319-5.bam
@rem CM-H3K4me3-Duplicate-241-4.bam
@rem EM-H2AZ-208-7.bam
@rem EM-H3K4me1-Duplicate-319-6.bam
@rem EM-H3K4me3-Duplicate-241-5.bam
@rem Naive-H2AZ-208-5.bam
@rem Naive-H3K4me1-Duplicate-319-4.bam
@rem Naive-H3K4me3-Duplicate-236-8.bam
